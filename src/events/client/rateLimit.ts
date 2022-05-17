import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  private client: ArgusClient;

  constructor(client: ArgusClient) {
    this.client = client;
  }

  public async run(...args: any): Promise<void> {
    this.client.logger.warning('The client is hit by ratelimit', [...args]);
  }
}
