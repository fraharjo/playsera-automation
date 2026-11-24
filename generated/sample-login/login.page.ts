import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get inputEmail(): Locator {
    return this.page.getByLabel('Email', { exact: false });
  }

  get inputPassword(): Locator {
    return this.page.getByLabel('Password', { exact: false });
  }

  get btnSubmit(): Locator {
    return this.page.getByRole('button', { name: /log in|sign in|masuk/i });
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

export default LoginPage;
