import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { renderMail, type MailTemplate } from './mail-renderer';
import { parseSender } from './sender';

interface Outgoing {
  to: string;
  subject: string;
  template: MailTemplate;
  values: Record<string, string>;
  text: string;
}

interface Message {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface Transport {
  readonly label: string;
  verify(): Promise<void>;
  send(message: Message): Promise<void>;
}

const TIMEOUT = 10_000;
const BREVO_API = 'https://api.brevo.com/v3';

class BrevoTransport implements Transport {
  readonly label = "l'API Brevo";

  constructor(private readonly apiKey: string) {}

  async verify() {
    const response = await this.call('/account', 'GET');
    if (!response.ok) throw new Error(`clé refusée (HTTP ${response.status})`);
  }

  async send(message: Message) {
    const response = await this.call('/smtp/email', 'POST', {
      sender: parseSender(env.MAIL_FROM),
      to: [{ email: message.to }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} : ${await response.text()}`);
    }
  }

  private call(path: string, method: 'GET' | 'POST', body?: unknown) {
    return fetch(`${BREVO_API}${path}`, {
      method,
      headers: {
        'api-key': this.apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT),
    });
  }
}

class SmtpTransport implements Transport {
  readonly label = `SMTP ${env.SMTP_HOST}:${env.SMTP_PORT}`;
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? '' }
      : undefined,
    connectionTimeout: TIMEOUT,
    greetingTimeout: TIMEOUT,
    socketTimeout: TIMEOUT * 2,
  });

  async verify() {
    await this.transporter.verify();
  }

  async send(message: Message) {
    await this.transporter.sendMail({ from: env.MAIL_FROM, ...message });
  }
}

function pickTransport(): Transport | null {
  if (env.BREVO_API_KEY) return new BrevoTransport(env.BREVO_API_KEY);
  if (env.SMTP_HOST) return new SmtpTransport();
  return null;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly transport = pickTransport();

  get configured(): boolean {
    return this.transport !== null;
  }

  onModuleInit() {
    const transport = this.transport;
    if (!transport) {
      this.logger.warn(
        'Aucun envoi configuré : les emails seront journalisés.',
      );
      return;
    }
    transport.verify().then(
      () => this.logger.log(`Envoi des emails par ${transport.label}`),
      (error: unknown) =>
        this.logger.warn(`${transport.label} injoignable : ${String(error)}`),
    );
  }

  deliver(send: () => Promise<void>, what: string) {
    send().catch((error: unknown) =>
      this.logger.warn(`${what} non envoyé : ${String(error)}`),
    );
  }

  async sendPasswordReset(to: string, pseudo: string, link: string) {
    await this.send({
      to,
      subject: 'Réinitialiser votre mot de passe LinguaGo',
      template: 'password-reset',
      values: { pseudo, link, logoUrl: `${env.CLIENT_URL}/pwa-192x192.png` },
      text: `Bonjour ${pseudo},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien dans l'heure qui vient :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nLinguaGo`,
    });
  }

  async sendWelcome(to: string, pseudo: string, link: string) {
    await this.send({
      to,
      subject: 'Bienvenue sur LinguaGo',
      template: 'welcome',
      values: { pseudo, link, logoUrl: `${env.CLIENT_URL}/pwa-192x192.png` },
      text: `Hello ${pseudo} !\n\nBienvenue sur LinguaGo. Votre première série vous attend ici : ${link}\n\nLinguaGo`,
    });
  }

  private async send(mail: Outgoing) {
    if (!this.transport) {
      this.logger.warn(
        `Envoi non configuré : « ${mail.subject} » pour ${mail.to} non envoyé (${mail.values.link ?? ''})`,
      );
      return;
    }
    await this.transport.send({
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: await renderMail(mail.template, mail.values),
    });
  }
}
