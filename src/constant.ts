import { PresenceData } from 'discord.js';

/** Utility structure to organize admin user IDs. */
export enum Admins {
  /** `glazk0#1312` on Discord. */
  glazk0 = '309620533761146880',
  /** `Marco.#2455` on Discord. */
  Marco = '309620533761146880',
}

/** Presence data to use with the client on login. */
export const presence: PresenceData = {
  activities: [{ name: 'for crypto', type: 'WATCHING' }],
};
