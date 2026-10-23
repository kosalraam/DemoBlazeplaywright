import { test, expect } from '../../src/fixtures/api-fixtures';
import { ADMIN_CREDENTIALS } from '../../src/data/bookings';

test.describe('API Authentication', () => {
  test('the service health endpoint is up', async ({ api }) => {
    expect(await api.healthCheck()).toBe(201);
  });

  test('valid credentials return a token', async ({ api }) => {
    const response = await api.authenticate(
      ADMIN_CREDENTIALS.username,
      ADMIN_CREDENTIALS.password
    );
    expect(response.status()).toBe(200);
    const body = await response.json() as { token?: string };
    expect(typeof body.token).toBe('string');
    expect(body.token?.length).toBeGreaterThan(0);
  });

  test('invalid credentials are rejected with no token', async ({ api }) => {
    const response = await api.authenticate('admin', 'wrong-password');
    expect(response.status()).toBe(200);
    const body = await response.json() as { reason?: string; token?: string };
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });
});
