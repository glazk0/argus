import { captureException } from '@sentry/node';
import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  private client: ArgusClient;

  constructor(client: ArgusClient) {
    this.client = client;
  }

  public async run(...args: any): Promise<void> {
    this.client.logger.error('An error event was sent by Discord.js', [...args]);
    captureException([...args]);
  }
}
