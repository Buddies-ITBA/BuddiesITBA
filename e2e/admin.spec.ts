import { expect, test } from '@playwright/test';
import { loginAsAdmin, unique } from './helpers';

test('admin pages require a session', async ({ page }) => {
  await page.goto('/admin/events');
  await expect(page).toHaveURL('/admin/login');
});

test('wrong password is rejected', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill('admin@buddies.local');
  await page.getByLabel('Contraseña').fill('nope');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();
});

test('create an event with a form, fill it publicly, see the waitlist and export CSV', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  await loginAsAdmin(page);

  await page.goto('/admin/events/new');
  await page.getByLabel('Título (ES)').fill('Viaje a Tigre e2e');
  await page.getByLabel('Fecha y hora (hora de Buenos Aires)').fill('2030-05-10T09:30');
  await page.getByLabel('Lugar').fill('Estación Retiro');
  await page.getByLabel('Publicado').check();
  await page.getByText('Formulario en la web').click();
  await page.getByLabel(/^Cupo/).fill('1');
  await page.getByLabel('Nueva pregunta:').selectOption('select');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await page.getByLabel('Pregunta (ES)').fill('Talle de remera');
  await page.getByLabel('Opción (ES)').fill('M');
  await page.getByRole('button', { name: 'Crear evento' }).click();
  await expect(page.getByText('Evento creado.')).toBeVisible();
  const adminEventUrl = page.url().split('?')[0];

  for (const [name, expected] of [
    ['Ana Pérez', 'Ya estás inscripto/a'],
    ['Leo Chen', 'lista de espera'],
  ]) {
    await page.goto('/events/viaje-a-tigre-e2e');
    await page.getByLabel('Nombre y apellido').fill(name);
    await page.getByLabel('Email').fill(unique(name.split(' ')[0].toLowerCase()));
    await page.getByLabel('Talle de remera').selectOption('m');
    await page.getByLabel(/Acepto que Buddies/).check();
    await page.getByRole('button', { name: 'Inscribirse' }).click();
    await expect(page.getByRole('status')).toContainText(expected);
  }

  await page.goto(`${adminEventUrl}/registrations`);
  await expect(page.getByText('1 confirmados de 1 · 1 en espera')).toBeVisible();

  // Cancelling the confirmed person promotes the one waiting
  const anaRow = page.getByRole('row', { name: /Ana Pérez/ });
  await anaRow.getByLabel('Cambiar estado').selectOption('cancelled');
  await anaRow.getByRole('button', { name: 'Cambiar' }).click();
  await expect(page.getByText('1 confirmados de 1 · 0 en espera · 1 cancelados')).toBeVisible();

  const csv = await (await page.request.get(`${adminEventUrl}/registrations/csv`)).text();
  expect(csv).toContain('Talle de remera');
  expect(csv).toContain('Leo Chen');
});
