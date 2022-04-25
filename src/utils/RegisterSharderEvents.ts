import { SharderEvents, ShardingManager } from 'kurasuta';
import { runningInProduction } from '../config';
import Logger from './Logger';

export function registerSharderEvents(sharder: ShardingManager, logger: typeof Logger): ShardingManager {
  if (!runningInProduction) {
    sharder.on(SharderEvents.DEBUG, message => {
      logger.debug(message);
    });
    sharder.on(SharderEvents.MESSAGE, message => {
      logger.debug(message);
    });
  }
  sharder.on(SharderEvents.SPAWN, cluster => {
    logger.info(`Cluster #${cluster.id} spawned.`);
  });
  sharder.on(SharderEvents.READY, cluster => {
    logger.info(`Cluster #${cluster.id} ready.`);
  });
  sharder.on(SharderEvents.SHARD_READY, shardID => {
    logger.info(`Shard #${shardID} ready.`);
  });
  sharder.on(SharderEvents.SHARD_RECONNECT, shardID => {
    logger.info(`Shard #${shardID} reconnection in progress on the servers containing this shard...`);
  });
  sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) => {
    logger.info(`Shard #${shardID} successfully reconnected, replayed ${replayed} times.`);
  });
  sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) => {
    logger.warn(
      `Shard #${shardID} disconnected from its servers and users temporarily. (${closeEvent.code}, ${
        closeEvent.wasClean ? '' : 'not'
      } clean): ${closeEvent.reason}`
    );
  });

  return sharder;
}
