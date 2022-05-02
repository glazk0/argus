import { BaseCluster, ShardingManager } from 'kurasuta';
import { discordToken } from '../config';
import Logger from '../utils/Logger';
import { ArgusClient } from './ArgusClient';

export class ArgusCluster extends BaseCluster {
  public client!: ArgusClient;
  logger: typeof Logger;

  constructor(...args: [ShardingManager]) {
    super(...args);

    this.logger = Logger;
    this.client.cluster = this;
  }

  async launch(): Promise<void> {
    this.client.init().catch((error) => {
      this.logger.error('Failed to initialize client.', error);
      throw error;
    });
    this.client.login(discordToken).catch((error) => {
      this.logger.error('Failed to login client.', error);
      throw error;
    });
  }
}

export default ArgusCluster;
