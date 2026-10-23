import dotenv from 'dotenv';

dotenv.config();

export interface Credentials {
  username: string;
  password: string;
}

export const config = {
  webBaseURL: process.env.BASE_URL ?? 'https://www.demoblaze.com',
  apiBaseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  apiCredentials: {
    username: process.env.API_USERNAME ?? 'admin',
    password: process.env.API_PASSWORD ?? 'password123'
  } satisfies Credentials,
  demoblazeCredentials:
    process.env.DEMOBLAZE_USERNAME && process.env.DEMOBLAZE_PASSWORD
      ? {
          username: process.env.DEMOBLAZE_USERNAME,
          password: process.env.DEMOBLAZE_PASSWORD
        } satisfies Credentials
      : null,
  proxy: process.env.HTTPS_PROXY || process.env.HTTP_PROXY || undefined
};
