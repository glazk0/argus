import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  private client: ArgusClient;

  constructor(client: ArgusClient) {
    this.client = client;
  }

  public async run(): Promise<void> {
    this.client.logger.info(`${this.client.user?.tag}, ready to serve ${this.client.guilds.cache.size} servers.`);
  }
}
