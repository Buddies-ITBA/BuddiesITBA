import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test('site settings drive the home stats and the community link', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/settings');
  await page.getByLabel('Número 2').fill('41');
  await page.getByLabel('Link de invitación a la comunidad de WhatsApp').fill('https://chat.whatsapp.com/ejemplo');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Configuración guardada')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('41', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sumate a la comunidad de WhatsApp' })).toHaveAttribute('href', 'https://chat.whatsapp.com/ejemplo');
});

test('home shows testimonials, passport stamps and availability', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Estudiantes de \d+ países/)).toBeVisible();
  await expect(page.getByText('Emma Schneider').first()).toBeVisible();
  await expect(page.getByText('Inscripción abierta').first()).toBeVisible();
});

test('events calendar feed is a valid subscription', async ({ request }) => {
  const response = await request.get('/events/calendar.ics');
  expect(response.headers()['content-type']).toContain('text/calendar');
  const body = await response.text();
  expect(body).toContain('BEGIN:VCALENDAR');
  expect(body).toContain('SUMMARY:Asado de bienvenida');
});

test('cron endpoint rejects calls without the secret', async ({ request }) => {
  expect((await request.get('/api/cron/reminders')).status()).toBe(401);
});
