import { expect, test } from '@playwright/test';
import { fakeApi } from './support/fakeApi';

test('la session du jour enchaîne un texte à trous et une remise dans l’ordre', async ({
  page,
}) => {
  await fakeApi(page, { signedIn: true, answers: { 21: false, 22: true } });
  await page.goto('/dashboard/daily');

  await expect(page.getByRole('heading', { name: 'La session du jour' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Mot manquant' }).fill('are');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText("Ce n'est pas ça")).toBeVisible();
  await expect(page.getByText(/Votre réponse/)).toBeVisible();
  await page.getByRole('button', { name: 'Suivant' }).click();

  for (const word of ['i', 'am', 'a', 'student']) {
    await page
      .getByLabel('Mots disponibles')
      .getByRole('button', { name: word, exact: true })
      .click();
  }
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText(/^Bonne réponse/)).toBeVisible();
  await page.getByRole('button', { name: 'Voir le résumé' }).click();
  await expect(page.getByRole('heading', { name: 'Série terminée' })).toBeVisible();
});

test('la page de révision explique quand rien n’est dû', async ({ page }) => {
  await fakeApi(page, { signedIn: true });
  await page.goto('/dashboard/review');
  await expect(page.getByText('Rien à revoir pour le moment')).toBeVisible();
});
