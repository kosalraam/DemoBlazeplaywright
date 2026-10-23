import { test as base, request as playwrightRequest, expect } from '@playwright/test';
import { BookerClient } from '../api/booker-client';
import { config } from '../config/env';

interface ApiFixtures {
  api: BookerClient;
  apiToken: string;
}

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: config.apiBaseURL,
      ...(config.proxy ? { proxy: { server: config.proxy } } : {}),
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    await use(new BookerClient(context));
    await context.dispose();
  },
  apiToken: async ({ api }, use) => {
    const token = await api.getToken(
      config.apiCredentials.username,
      config.apiCredentials.password
    );
    await use(token);
  }
});

export { expect };
