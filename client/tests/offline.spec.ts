import { expect, test } from '@playwright/test';
import { fakeApi } from './support/fakeApi';

test('une réponse donnée hors connexion est vérifiée localement puis synchronisée', async ({
  page,
  context,
}) => {
  await fakeApi(page, { signedIn: true, answers: { 7: true } });
  await page.goto('/dashboard/learn/A1');

  await page.getByRole('button', { name: 'Ajouter aux favoris' }).click();
  await expect(page.getByText('Ajoutée aux favoris', { exact: true })).toBeVisible();

  await page.goto('/dashboard/favorites');
  await page.getByRole('link', { name: 'Premiers mots en anglais' }).click();
  await expect(page.getByText('Exercice 1')).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByText('Hors connexion').first()).toBeVisible();

  await page.getByRole('radio', { name: 'Hello' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText(/^Bonne réponse/)).toBeVisible();
  await expect(page.getByText(/réponse vérifiée localement/)).toBeVisible();
  await expect(page.getByText('1 réponse à synchroniser')).toBeVisible();

  const synced = page.waitForRequest(/\/api\/exercises\/7\/answer$/);
  await context.setOffline(false);
  await synced;
  await expect(page.getByText(/réponse à synchroniser/)).toBeHidden();
});
