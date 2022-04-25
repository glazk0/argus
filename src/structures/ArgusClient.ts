import { PrismaClient } from '@prisma/client';
import { init as initSentry } from '@sentry/node';
import { Client, ClientOptions } from 'discord.js';
import * as pkg from '../../package.json';
import { runningInCI, runningInProduction, sentryDSN } from '../config';
import { presence } from '../constant';
import Logger from '../utils/Logger';
import { ArgusCluster } from './ArgusCluster';

export class ArgusClient extends Client {
  prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'info' },
    ],
  });

  cluster?: ArgusCluster;

  logger: typeof Logger;

  constructor(clientOptions: ClientOptions) {
    super({
      presence,
      ...clientOptions,
    });
    if (sentryDSN) {
      initSentry({
        dsn: sentryDSN,
        debug: !runningInProduction,
        environment: runningInProduction ? 'production' : 'development',
        release: `bot-${pkg.version}`,
      });
    }
    this.logger = Logger;
  }
  async init(): Promise<this> {
    this.prisma.$on('info', (event: unknown) => {
      this.logger.info(event);
    });
    this.prisma.$on('warn', (event: unknown) => {
      this.logger.warn(event);
    });

    if (!runningInCI) {
      await this.prisma.$connect();
    }

    return this;
  }
}

export default ArgusClient;
