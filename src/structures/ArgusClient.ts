import { PrismaClient } from '@prisma/client';
import { init as initSentry } from '@sentry/node';
import { Client, ClientOptions } from 'discord.js';
import fs from 'fs';
import path from 'path';
import util from 'util';
import * as pkg from '../../package.json';
import { runningInCI, runningInProduction, sentryDSN } from '../config';
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

    this.loadEvents();

    if (!runningInCI) {
      await this.prisma.$connect();
    }

    return this;
  }

  async loadEvents(): Promise<void> {
    const readdir = util.promisify(fs.readdir);
    const directory = await readdir('./src/events/');
    this.logger.info(`Loading a total of ${directory.length} event categories.`);
    directory.forEach(async (dir) => {
      const events = await readdir(`./src/events/${dir}/`);
      events
        .filter((event) => event.split('.').pop() === 'ts')
        .forEach((event) => {
          const eventName = event.split('.')[0];
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const event = new (require(`../events/${dir}${path.sep}${eventName}`).default)(this);
            this.logger.info(`Loading event: ${eventName}`);
            this.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(`../events/${dir}${path.sep}${eventName}`)];
          } catch (error) {
            this.logger.error(`Unable to load interaction ${eventName}: ${error}`);
          }
        });
    });
  }

  async destroy(): Promise<void> {
    await this.prisma.$disconnect();
    super.destroy();
  }
}

export default ArgusClient;
