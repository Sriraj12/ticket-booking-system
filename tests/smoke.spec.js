const { test, expect } = require('@playwright/test');

test('login page renders the sign-in form', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Book your favorite movies')).toBeVisible();
  await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  await expect(page.getByLabel(/Email Address/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
});
