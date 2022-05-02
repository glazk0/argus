import { captureException } from '@sentry/node';
import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run(...args: never) {
    this.client.logger.error('An error event was sent by Discord.js', [...args]);
    captureException([...args]);
  }
}
