import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import mjml2html from 'mjml';

export type MailTemplate = 'password-reset' | 'welcome';

const cache = new Map<MailTemplate, string>();

function source(name: MailTemplate): string {
  const cached = cache.get(name);
  if (cached) return cached;
  const content = readFileSync(
    join(__dirname, 'templates', `${name}.mjml`),
    'utf8',
  );
  cache.set(name, content);
  return content;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    escapeHtml(values[key] ?? ''),
  );
}

export async function renderMail(
  name: MailTemplate,
  values: Record<string, string>,
): Promise<string> {
  const { html, errors } = await mjml2html(fillTemplate(source(name), values), {
    validationLevel: 'strict',
  });
  if (errors.length > 0) {
    throw new Error(
      `Gabarit ${name} invalide : ${errors.map((e: { message: string }) => e.message).join(', ')}`,
    );
  }
  return html;
}
