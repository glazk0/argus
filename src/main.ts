import * as dotenv from 'dotenv';

dotenv.config();

import { CacheWithLimitsOptions, Intents, Options, Sweepers } from 'discord.js';
import { ShardingManager } from 'kurasuta';
import { join } from 'path';
import { cacheUsers, discordToken, runningInProduction } from './config';
import Logger from './utils/Logger';
import { registerSharderEvents } from './utils/RegisterSharderEvents';

const cacheOptions: CacheWithLimitsOptions = {
  ...Options.defaultMakeCacheSettings,
  MessageManager: {
    // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
    maxSize: Infinity,
    sweepInterval: 300, // 5 Minutes
    sweepFilter: Sweepers.filterByLifetime({
      lifetime: 10800, // 3 Hours
    }),
  },
  ThreadManager: {
    // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
    maxSize: Infinity,
    sweepInterval: 300, // 5 Minutes
    sweepFilter: Sweepers.filterByLifetime({
      lifetime: 10800, // 3 Hours
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      getComparisonTimestamp: event => event.archiveTimestamp!,
      excludeFromSweep: event => !event.archived,
    }),
  },
};

const sharder = new ShardingManager(join(__dirname, 'structures', 'ArgusCluster'), {
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
  },
  development: !runningInProduction,
  respawn: runningInProduction,
  retry: runningInProduction,
  token: discordToken,
});

registerSharderEvents(sharder, Logger);

sharder.spawn().catch(error => Logger.error('Shard spawn has occured a error.', error));
