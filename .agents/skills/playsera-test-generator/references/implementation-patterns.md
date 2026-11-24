# Implementation Patterns (Playwright Edition)

Contents: Selector conventions, BasePage pattern, Playwright Spec pattern, Test Data Hub, Assertion strategy, and Validation commands.

## Selector Conventions & Smart Contracts

Never guess selectors. Priority of sources:
1. Playwright built-in user-facing locators:
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByLabel('Email address')`
   - `page.getByPlaceholder('Enter your password')`
   - `page.getByText('Welcome back')`
2. Test IDs / Stable Attributes:
   - `page.getByTestId('login-submit-btn')`
3. For pending, unfinished, or shift-left features: wrap with `this.contract('<screen>-<element>-<type>')`.
   - Maps to `[data-testid="<id>"]`, `[name="<id>"]`, `#<id>`.
   - Gives developers a clear testability contract to implement while tests are written in advance.

## BasePage Pattern (`shared/pages/base.page.ts`)

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Live element locators
  get inputEmail(): Locator {
    return this.page.getByLabel('Email', { exact: false });
  }

  get inputPassword(): Locator {
    return this.page.getByLabel('Password', { exact: false });
  }

  get btnSubmit(): Locator {
    return this.page.getByRole('button', { name: /log in|masuk/i });
  }

  get alertError(): Locator {
    return this.contract('login-error-alert');
  }

  get dashboardHeader(): Locator {
    return this.contract('dashboard-welcome-header');
  }

  async login(email: string, pass: string): Promise<void> {
    await this.fill(this.inputEmail, email);
    await this.fill(this.inputPassword, pass);
    await this.click(this.btnSubmit);
  }
}
```

## Playwright Spec Pattern (`<feature>.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './login.page';
import { dataFactory } from '../../shared/data/data-factory';

test.describe('@feature-login @web', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('/login');
  });

  test('P01: Successful login with registered user credentials', {
    tag: ['@smoke', '@p0', '@automated', '@web', '@positive', '@AC-01', '@feature-login', '@REQ-AUTH-001']
  }, async () => {
    await loginPage.login('tester@example.com', 'ValidPass123!');
    await expect(loginPage.dashboardHeader).toBeVisible();
    await expect(loginPage.dashboardHeader).toContainText('Dashboard');
  });

  test('N01: Prevent login when password is incorrect', {
    tag: ['@regression', '@p1', '@automated', '@web', '@negative', '@AC-02', '@feature-login', '@REQ-AUTH-001']
  }, async () => {
    await loginPage.login('tester@example.com', 'WrongSecret!');
    await expect(loginPage.alertError).toBeVisible();
    await expect(loginPage.alertError).toHaveText(/invalid credentials|salah/i);
  });
});
```

## Assertion Strategy: Outcome Verification vs Mere Presence

Always assert actual business outcome, state changes, or exact content. Never write weak assertions that pass on empty/wrong states:

```typescript
// ❌ WEAK (Checks existence only - passes even if message is blank or displays an error!)
await expect(checkoutPage.alertNotice).toBeVisible();

// ✅ ROBUST (Verifies specific business outcome, content, and state)
await expect(checkoutPage.alertNotice).toBeVisible();
await expect(checkoutPage.alertNotice).toHaveText(/Payment Successful|Pembayaran Berhasil/i);
await expect(checkoutPage.orderIdText).toHaveText(/^ORD-[0-9]{8}$/);
```

## Validation Commands

```bash
# Verify generated draft against tag taxonomy & matrix
npm run check:generated -- generated/checkout

# Lint test tags
npm run lint:tags

# Typecheck TypeScript definitions
npm run typecheck
```
