import { BaseCluster, ShardingManager } from 'kurasuta';
import { discordToken } from '../config';
import Logger from '../utils/Logger';
import { ArgusClient } from './ArgusClient';

export class ArgusCluster extends BaseCluster {
  public client!: ArgusClient;
  public logger: typeof Logger;

  constructor(...args: [ShardingManager]) {
    super(...args);
    this.logger = Logger;
    this.client.cluster = this;
  }

  /* Launching the client. */
  public async launch(): Promise<void> {
    this.client.init().catch((e) => {
      this.logger.error('Failed to initialize client', e);
      throw e;
    });
    this.client.login(discordToken).catch((e) => {
      this.logger.error('Failed to login client.', e);
      throw e;
    });
  }
}

export default ArgusCluster;
