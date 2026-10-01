import { expect, test } from '@playwright/test';
import { unique } from './helpers';

test('home shows the hero and upcoming events', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Buddies');
  await expect(page.getByRole('link', { name: 'Asado de bienvenida' })).toBeVisible();
});

test('language switch keeps the URL and remembers the choice', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eventos y actividades');
  await page.getByRole('button', { name: 'en', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Events & activities');
  await expect(page).toHaveURL('/events');
  await page.goto('/faq');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('old /en links redirect and switch to English', async ({ page }) => {
  await page.goto('/en/events');
  await expect(page).toHaveURL('/events');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Events & activities');
});

test('register for an event with a custom form', async ({ page }) => {
  await page.goto('/events/asado-de-bienvenida');
  await page.getByLabel('Nombre y apellido').fill('Emma Schneider');
  await page.getByLabel('Email').fill(unique('emma'));
  await page.getByLabel('Alimentación').selectOption('vegetarian');
  await page.getByLabel(/Acepto que Buddies/).check();
  await page.getByRole('button', { name: 'Inscribirse' }).click();
  await expect(page.getByRole('status')).toContainText('Ya estás inscripto/a');
});

test('FAQ search ignores accents', async ({ page }) => {
  await page.goto('/faq');
  await page.getByRole('searchbox').fill('como me muevo');
  await expect(page.getByRole('button', { name: '¿Cómo me muevo por la ciudad?' })).toBeVisible();
  await expect(page.getByRole('button', { name: '¿Qué SIM o plan de celular conviene?' })).toHaveCount(0);
});

test('unknown pages show the localized 404', async ({ page }) => {
  const response = await page.goto('/no-existe');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página se perdió en el viaje');
});
