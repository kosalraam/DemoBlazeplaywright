import { config, type Credentials } from '../config/env';

export type { Credentials };

export function generateUser(prefix = 'qa'): Credentials {
  const unique = `${prefix}${Date.now()}${Math.floor(Math.random() * 10_000)}`;
  const password = `Pw!${Math.random().toString(36).slice(2, 10)}A1`;
  return { username: unique, password };
}

export function credentialsFromEnv(): Credentials | null {
  return config.demoblazeCredentials;
}
