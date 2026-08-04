const { test, expect } = require('@playwright/test');

test('login page renders the sign-in form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByText('Book your favorite movies')).toBeVisible();
  await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
