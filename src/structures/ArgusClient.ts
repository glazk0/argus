import { PrismaClient } from '@prisma/client';
import { init as initSentry } from '@sentry/node';
import { Client, ClientOptions } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import * as pkg from '../../package.json';
import { runningInCI, runningInProduction, sentryDSN } from '../config';
import Logger from '../utils/Logger';
import { ArgusCluster } from './ArgusCluster';

export class ArgusClient extends Client {
  public prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'info' },
    ],
  });

  public cluster?: ArgusCluster;
  public logger: typeof Logger;

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

  /**
   * It connects to the database and loads the events.
   * @returns The instance of the client
   */
  public async init(): Promise<this> {
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

  /**
   * It loads all the events from the events folder
   */
  private async loadEvents(): Promise<void> {
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
          } catch (e) {
            this.logger.error(`Unable to load interaction ${eventName}: ${e}`);
          }
        });
    });
  }

  /**
   * It disconnects from the Prisma database and then destroys the client
   */
  public async destroy(): Promise<void> {
    await this.prisma.$disconnect();
    super.destroy();
  }
}

export default ArgusClient;
