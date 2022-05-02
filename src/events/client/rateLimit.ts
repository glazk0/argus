import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run(...args: never) {
    this.client.logger.warning('The client is hit by ratelimit', [...args]);
  }
}
