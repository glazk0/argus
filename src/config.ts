import { Snowflake } from 'discord.js';
import escapeStringRegExp from 'escape-string-regexp';
import { URL } from 'node:url';
import { Admins } from './constant';

/** If we cache users or let refresh the cache. */
export const cacheUsers = false;

/** Whether or not the bot is running in a production environment. */
export const runningInProduction = process.env.NODE_ENV === 'production';

/** Whether or not the bot is running in a CI environment. */
export const runningInCI = Boolean(process.env.CI);

/** Array of Discord user IDs for owners of the bot. */
export const owners: Snowflake[] = [Admins.glazk0, Admins.Marco];

/** Discord bot token. */
export const discordToken = process.env.TOKEN;

/**
 * Sentry DSN.
 * @see https://docs.sentry.io/error-reporting/quickstart/?platform=node#configure-the-sdk
 */
export const sentryDSN = process.env.SENTRY_DSN;

// Discord tokens are separated by `.`s into 3 base64-encoded parts.
// 1. Bot ID
// 2. Token creation time
// 3. HMAC
// Parts 2 and 3 are sensitive information
const disassembledToken = discordToken?.split('.') ?? [];

/** An array of sensitive strings (ex. API keys) that shouldn't be shown in logs or in messages. */
export const secrets: string[] = [];

// Only mark the secret parts of a Discord token as secrets
if (disassembledToken.length === 3) {
  secrets.push(disassembledToken[1], disassembledToken[2]);
}

/** The PostgreSQL database URI in a URL object, if it's present in the environment. */
export const postgresURI = process.env.POSTGRES_URI ? new URL(process.env.POSTGRES_URI) : undefined;

/* It's adding the password to the secrets array. */
for (const secret of [sentryDSN, postgresURI?.password]) {
  if (secret) {
    secrets.push(escapeStringRegExp(secret));
  }
}
