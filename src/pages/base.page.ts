import type { Page } from '@playwright/test';

/** Shared base class for page objects. */
export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  /**
   * Register before clicking the control that triggers a native browser dialog.
   * The dialog is accepted and its message returned to the caller.
   */
  protected captureDialog(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await dialog.accept();
        resolve(message);
      });
    });
  }
}
