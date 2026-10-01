import { expect, type Page } from '@playwright/test';

export const unique = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill('admin@buddies.local');
  await page.getByLabel('Contraseña').fill('buddies-admin');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('/admin');
}
