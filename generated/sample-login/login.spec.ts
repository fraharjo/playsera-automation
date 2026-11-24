import { test, expect } from '@playwright/test';
import { LoginPage } from './login.page';

test.describe('@feature-login @web @REQ-AUTH-01', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('/login');
  });

  test('P01: User logs in successfully with valid credentials', {
    tag: ['@smoke', '@p0', '@automated', '@web', '@positive', '@AC-01', '@feature-login', '@REQ-AUTH-01']
  }, async () => {
    await loginPage.login('tester@example.com', 'ValidPass123!');
    await expect(loginPage.dashboardHeader).toBeVisible();
  });

  test('N01: Show error alert when password is incorrect', {
    tag: ['@regression', '@p1', '@automated', '@web', '@negative', '@AC-02', '@feature-login', '@REQ-AUTH-01']
  }, async () => {
    await loginPage.login('tester@example.com', 'WrongPass!');
    await expect(loginPage.alertError).toBeVisible();
    await expect(loginPage.alertError).toContainText('Invalid');
  });

  // Open question: Should account lock after 5 attempts?
  test('E01: Account lockout after consecutive failed attempts', {
    tag: ['@regression', '@p2', '@automated', '@web', '@negative', '@AC-03', '@feature-login', '@REQ-AUTH-01', '@blocked']
  }, async () => {
    for (let i = 0; i < 5; i++) {
      await loginPage.login('locked@example.com', 'BadPass!');
    }
    await expect(loginPage.alertError).toContainText('locked');
  });
});
