// src/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

const cleanEnvVar = (val: string | undefined, fallback: string = ''): string => {
  if (!val) return fallback;
  return val.replace(/^["']|["']$/g, ''); // strip leading/trailing quotes
};

export const config = {
  port: process.env.PORT || 3000,
  environment: cleanEnvVar(process.env.NODE_ENV, 'development'),
  databaseUrl: cleanEnvVar(process.env.DATABASE_URL),
  apiVersion: cleanEnvVar(process.env.API_VERSION, 'v1'),
  loggly: {
    enabled: process.env.LOGGLY_ENABLED,
    token: cleanEnvVar(process.env.LOGGLY_TOKEN),
    subdomain: cleanEnvVar(process.env.LOGGLY_SUBDOMAIN),
    tags: cleanEnvVar(process.env.LOGGLY_TAGS, 'production'),
  },
  jwt: {
    secret: cleanEnvVar(process.env.JWT_SECRET),
    expiration: cleanEnvVar(process.env.JWT_EXPIRATION, '1d'),
    issuer: 'Connectify',
  },
  googleClientId: cleanEnvVar(process.env.GOOGLE_CLIENT_ID),
};
