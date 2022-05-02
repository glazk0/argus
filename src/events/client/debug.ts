import { runningInProduction } from '../../config';
import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  client: ArgusClient;
  constructor(client: ArgusClient) {
    this.client = client;
  }
  async run(...args: never) {
    if (!runningInProduction) this.client.logger.debug([...args]);
  }
}
