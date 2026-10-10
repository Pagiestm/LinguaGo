import { fillTemplate, renderMail } from './mail-renderer';

describe('fillTemplate', () => {
  it('remplace les variables et échappe le HTML', () => {
    expect(
      fillTemplate('Bonjour {{ pseudo }}, lien : {{link}}', {
        pseudo: '<b>Lea</b>',
        link: 'https://a.b/?x=1&y=2',
      }),
    ).toBe('Bonjour &lt;b&gt;Lea&lt;/b&gt;, lien : https://a.b/?x=1&amp;y=2');
  });

  it('laisse vide une variable absente', () => {
    expect(fillTemplate('[{{ rien }}]', {})).toBe('[]');
  });
});

describe('renderMail', () => {
  it('compile le gabarit de réinitialisation en HTML complet', async () => {
    const html = await renderMail('password-reset', {
      pseudo: 'Camille',
      link: 'https://linguago.test/reset?token=abc',
    });
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Camille');
    expect(html).toContain('https://linguago.test/reset?token=abc');
  });

  it('compile le gabarit de bienvenue', async () => {
    const html = await renderMail('welcome', {
      pseudo: 'Camille',
      link: 'https://linguago.test/dashboard',
    });
    expect(html).toContain('Camille');
    expect(html).toContain('LinguaGo');
  });
});
