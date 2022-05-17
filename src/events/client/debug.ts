import { runningInProduction } from '../../config';
import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  private client: ArgusClient;

  constructor(client: ArgusClient) {
    this.client = client;
  }

  public async run(...args: any): Promise<void> {
    if (!runningInProduction) this.client.logger.debug([...args]);
  }
}
