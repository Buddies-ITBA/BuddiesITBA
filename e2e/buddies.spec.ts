import { expect, test } from '@playwright/test';
import { loginAsAdmin, unique } from './helpers';

test('apply as an exchange student, match and send introductions', async ({ page }) => {
  await page.goto('/buddies');
  await page.getByRole('link', { name: /Quiero un buddy/ }).click();

  await page.getByLabel('Nombre y apellido').fill('Chloé Dubois');
  await page.getByLabel('Email').fill(unique('chloe'));
  await page.getByLabel(/WhatsApp/).fill('+33 6 12 34 56 78');
  await page.getByLabel('Universidad de origen').fill('Sciences Po');
  await page.getByLabel('País', { exact: true }).selectOption('FR');
  await page.getByLabel('Género', { exact: true }).selectOption('female');
  await page.getByText('Me da igual').click();
  for (const option of ['Inglés', 'Francés', 'Música y recitales', 'Gastronomía', 'Hacer amigos']) {
    await page.getByText(option, { exact: true }).click();
  }
  for (const question of ['¿Qué tan sociable te considerás?', '¿Cuánto te gusta salir de noche?', '¿Sos más de planificar o de improvisar?']) {
    await page.getByRole('group', { name: question }).getByText('4', { exact: true }).click();
  }
  await page.getByLabel('¿Cuánto tiempo podés dedicarle?').selectOption('medium');
  await page.getByLabel(/Acepto que Buddies/).check();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('status')).toContainText('Recibimos tu inscripción');

  await loginAsAdmin(page);
  await page.goto('/admin/buddies');
  await page.getByRole('link', { name: /Programa de ejemplo/ }).click();
  await page.getByRole('link', { name: 'Matching' }).click();
  await page.getByRole('button', { name: /Generar matches|Recalcular/ }).click();
  await expect(page.getByText(/Propuesta generada: \d+ matches/)).toBeVisible();

  await page.getByRole('button', { name: /Enviar presentaciones/ }).click();
  await expect(page.getByText(/se presentaron \d+ pares/)).toBeVisible();

  await page.goto('/admin/emails');
  await expect(page.getByRole('cell', { name: 'Presentación de buddies' }).first()).toBeVisible();
});
