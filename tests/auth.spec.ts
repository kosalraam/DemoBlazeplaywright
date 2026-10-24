import { test, expect } from '../src/fixtures/test-options';
import { generateUser } from '../src/data/users';

test.describe('Authentication', () => {
  test('TC01-A new user can sign up successfully @smoke', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const message = await auth.signup(user.username, user.password);
    expect(message).toContain('Sign up successful');
  });

  test('TC02-A registered user can log in @smoke', async ({ home, auth, nav }) => {
    await home.goto();
    const user = generateUser();
    const signupMessage = await auth.signup(user.username, user.password);
    expect(signupMessage).toContain('Sign up successful');

    const error = await auth.login(user.username, user.password);
    expect(error).toBeNull();
    await expect(nav.loggedInUser).toHaveText(`Welcome ${user.username}`);
    await expect(nav.logoutLink).toBeVisible();
    await nav.logout();
  });

  test('TC03-Login is rejected with a wrong password-Negative Testcase', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const signupMessage = await auth.signup(user.username, user.password);
    expect(signupMessage).toContain('Sign up successful');
    const error = await auth.login(user.username, `${user.password}_invalid`);
    // const error = await auth.login(user.username, 'definitely-wrong-password');
    expect(error).toContain('Wrong password');
  });

  test('TC04-Login is rejected for a non-existent user', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const error = await auth.login(`ghost${Date.now()}`,`${user.password}_invalid`);
    expect(error).toContain('User does not exist');
  });

  test('TC05-Signing up with an existing username is rejected', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    const first = await auth.signup(user.username, user.password);
    expect(first).toContain('Sign up successful');

    const second = await auth.signup(user.username, user.password);
    expect(second.toLowerCase()).toContain('this user already exist.');
  });
});
