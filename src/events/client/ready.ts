import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run() {
    this.client.logger.info(`${this.client.user?.tag}, ready to serve ${this.client.guilds.cache.size} servers.`);
  }
}
