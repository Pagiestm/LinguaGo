import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { renderMail, type MailTemplate } from './mail-renderer';

interface Outgoing {
  to: string;
  subject: string;
  template: MailTemplate;
  values: Record<string, string>;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? '' }
          : undefined,
      })
    : null;

  get configured(): boolean {
    return this.transporter !== null;
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
    if (!this.transporter) {
      this.logger.warn(
        `SMTP non configuré : « ${mail.subject} » pour ${mail.to} non envoyé (${mail.values.link ?? ''})`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: env.MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: await renderMail(mail.template, mail.values),
    });
  }
}
