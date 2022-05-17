import { CacheWithLimitsOptions, Intents, Options, Sweepers } from 'discord.js';
import { ShardingManager } from 'kurasuta';
import { join } from 'node:path';
import { cacheUsers, discordToken, runningInProduction } from './config';
import { presence } from './constant';
import { ArgusClient } from './structures/ArgusClient';
import Logger from './utils/Logger';
import { registerSharderEvents } from './utils/RegisterSharderEvents';

const cacheOptions: CacheWithLimitsOptions = {
  ...Options.defaultMakeCacheSettings,
  MessageManager: {
    // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
    maxSize: Number.POSITIVE_INFINITY,
    sweepInterval: 300, // 5 Minutes
    sweepFilter: Sweepers.filterByLifetime({
      lifetime: 10_800, // 3 Hours
    }),
  },
  ThreadManager: {
    // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
    maxSize: Number.POSITIVE_INFINITY,
    sweepInterval: 300, // 5 Minutes
    sweepFilter: Sweepers.filterByLifetime({
      lifetime: 10_800, // 3 Hours
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      getComparisonTimestamp: (event) => event.archiveTimestamp!,
      excludeFromSweep: (event) => !event.archived,
    }),
  },
};

const sharder = new ShardingManager(join(__dirname, 'structures', 'ArgusCluster'), {
  client: ArgusClient as any,
  clientOptions: {
    makeCache: Options.cacheWithLimits(
      cacheUsers ? cacheOptions : Object.assign(cacheOptions, { UserManager: { maxSize: 0 } })
    ),
    allowedMentions: {
      parse: ['users', 'roles'],
      repliedUser: false,
    },
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['CHANNEL', 'USER', 'GUILD_MEMBER'],
    presence: presence,
  },
  development: !runningInProduction,
  respawn: runningInProduction,
  retry: runningInProduction,
  token: discordToken,
});

registerSharderEvents(sharder, Logger);

sharder.spawn().catch((e) => Logger.error('Shard spawn has occured a error.', e));
