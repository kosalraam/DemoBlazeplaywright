import { test, expect } from '../src/fixtures/test-options';
import { generateUser } from '../src/data/users';

test.describe('Authentication', () => {
  test('a new user can sign up successfully @smoke', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const message = await auth.signup(user.username, user.password);
    expect(message).toContain('Sign up successful');
  });

  test('a registered user can log in @smoke', async ({ home, auth, nav }) => {
    await home.goto();
    const user = generateUser();
    const signupMessage = await auth.signup(user.username, user.password);
    expect(signupMessage).toContain('Sign up successful');

    const error = await auth.login(user.username, user.password);
    expect(error).toBeNull();
    await expect(nav.loggedInUser).toHaveText(`Welcome ${user.username}`);
    await expect(nav.logoutLink).toBeVisible();
  });

  test('login is rejected with a wrong password', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const signupMessage = await auth.signup(user.username, user.password);
    expect(signupMessage).toContain('Sign up successful');

    const error = await auth.login(user.username, 'definitely-wrong-password');
    expect(error).toContain('Wrong password');
  });

  test('login is rejected for a non-existent user', async ({ home, auth }) => {
    await home.goto();
    const error = await auth.login(`ghost${Date.now()}`, 'irrelevant');
    expect(error).toContain('User does not exist');
  });

  test('signing up with an existing username is rejected', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const first = await auth.signup(user.username, user.password);
    expect(first).toContain('Sign up successful');

    const second = await auth.signup(user.username, user.password);
    expect(second.toLowerCase()).toContain('already');
  });
});
