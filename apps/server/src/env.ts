import dotenv from 'dotenv';
import path from 'path';
import { getOsEnv } from './utils/env-utils';

const envPath = path.join(
  process.cwd(),
  `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`
);
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: envPath,
  });
}

const data = {
  PROPERTY_ID: getOsEnv('PROPERTY_ID'),
  PORT: getOsEnv('PORT'),
  GOOGLE_PRIVATE_KEY: getOsEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, "\n"),
  GOOGLE_CLIENT_EMAIL: getOsEnv('GOOGLE_CLIENT_EMAIL'),
};

export default data;