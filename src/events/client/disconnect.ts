import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run() {
    this.client.logger.warn(`${this.client.user?.tag} is disconnecting.`);
  }
}
