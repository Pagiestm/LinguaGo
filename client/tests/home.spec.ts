import { expect, test } from '@playwright/test';
import { fakeApi } from './support/fakeApi';

test('la page d’accueil présente les niveaux et mène à l’inscription', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText("Apprenez l'anglais");
  await expect(page.getByText('Débutant', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Créer un compte' }).first().click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
});

test('une page inconnue affiche la 404', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/nulle-part');
  await expect(page.getByRole('heading', { name: "Cette page n'existe pas" })).toBeVisible();
});
