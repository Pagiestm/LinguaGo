import { expect, test } from '@playwright/test';
import { fakeApi } from './support/fakeApi';

test('parcourt un niveau, répond à une série et voit le résumé', async ({ page }) => {
  await fakeApi(page, { signedIn: true, answers: { 7: true, 9: false } });
  await page.goto('/dashboard/learn');

  await expect(page.getByRole('heading', { name: 'Choisissez un niveau' })).toBeVisible();
  await page.getByRole('link', { name: /Débutant/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/learn\/A1$/);

  await page.getByRole('link', { name: 'Premiers mots en anglais' }).click();
  await expect(page.getByText('Exercice 1')).toBeVisible();

  await page.getByRole('radio', { name: 'Hello' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText(/^Bonne réponse/)).toBeVisible();
  await page.getByRole('button', { name: 'Suivant' }).click();

  await page.getByRole('button', { name: 'Faux' }).click();
  await expect(page.getByText("Ce n'est pas ça")).toBeVisible();
  await page.getByRole('button', { name: 'Voir le résumé' }).click();

  await expect(page.getByRole('heading', { name: 'Série terminée' })).toBeVisible();
  await expect(page.getByText('1 bonne réponse sur 2')).toBeVisible();
});

test('ajoute une série aux favoris et la retrouve dans la page Favoris', async ({ page }) => {
  await fakeApi(page, { signedIn: true });
  await page.goto('/dashboard/learn/A1');

  await page.getByRole('button', { name: 'Ajouter aux favoris' }).click();
  await expect(page.getByText('Ajoutée aux favoris', { exact: true })).toBeVisible();

  await page.goto('/dashboard/favorites');
  await expect(page.getByRole('link', { name: 'Premiers mots en anglais' })).toBeVisible();
});
