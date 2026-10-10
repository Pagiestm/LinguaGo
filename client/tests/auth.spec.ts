import { expect, test } from '@playwright/test';
import { fakeApi } from './support/fakeApi';

test('refuse un mauvais mot de passe puis connecte l’utilisateur', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/login');

  await page.getByLabel('Email').fill('camille@linguago.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mauvais');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();

  await page.getByLabel('Mot de passe', { exact: true }).fill('Motdepasse1!');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Camille');
});

test('le formulaire d’inscription n’envoie qu’un mot de passe conforme', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/register');

  await page.getByLabel('Pseudo').fill('Nadia');
  await page.getByLabel('Email').fill('nadia@linguago.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('faible');
  await expect(page.getByRole('button', { name: 'Créer mon compte' })).toBeDisabled();

  await page.getByLabel('Mot de passe', { exact: true }).fill('Motdepasse1!');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Bienvenue sur LinguaGo')).toBeVisible();
});

test('une route protégée redirige vers la connexion', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/dashboard/favorites');
  await expect(page).toHaveURL(/\/login\?next=/);
});
