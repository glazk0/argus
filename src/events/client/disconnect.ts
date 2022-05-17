import { ArgusClient } from '../../structures/ArgusClient';

export default class {
  private client: ArgusClient;

  constructor(client: ArgusClient) {
    this.client = client;
  }

  public async run(): Promise<void> {
    this.client.logger.warn(`${this.client.user?.tag} is disconnecting.`);
  }
}
