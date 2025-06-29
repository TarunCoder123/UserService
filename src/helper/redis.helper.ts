import * as redis from 'redis';
import { log } from '../utils/helper.utils';
import { REDIS_ERR_MSG, CLIENT_EVENTS } from '../constants/redis.constant';
require('dotenv').config();

class Redis {
  private static instance: Redis | null = null;

  public client!: redis.RedisClientType;

  private constructor() {} // Private for singleton

  public static getInstance(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }

  public async connectRedis(): Promise<boolean> {
    try {
      this.client = redis.createClient({
        url: `${process.env.REDIS_URL}/0`,
      });

      this._bindRedisClientEvents();

      await this.client.connect();
      return true;
    } catch (err) {
      log.red(REDIS_ERR_MSG.CONN_ERR, err);
      return false;
    }
  }

  public async releaseRedisConnection(): Promise<void> {
    await this.client.disconnect();
  }

  public async storeInRedis(
    hashMap: string,
    data: { [key: string]: string },
    expirationSeconds?: number
  ): Promise<number | null> {
    try {
      const result = await this.client.hSet(hashMap, data);
      if (expirationSeconds) {
        await this.client.expire(hashMap, expirationSeconds); // ✅ Fix here
      }
      return result;
    } catch (error) {
      log.red("storeInRedis error", error);
      return null;
    }
  }

  public async updateRedisTime(
    token: string,
    expiryTimeInSeconds: number
  ): Promise<number | boolean | null> {
    try {
      const result = await this.client.expire(token, expiryTimeInSeconds);
      return result;
    } catch (error) {
      log.red("updateRedisTime error", error);
      return null;
    }
  }

  public async getDataFromRedis(hashMap: string) {
    try {
      const userSession = await this.client.hGetAll(hashMap);
      return userSession;
    } catch (error) {
      log.red("getDataFromRedis error", error);
      return null;
    }
  }

  public async removeFromRedis(token: string): Promise<number | null> {
    try {
      return await this.client.del(token);
    } catch (error) {
      log.red("removeFromRedis error", error);
      return null;
    }
  }

  private _bindRedisClientEvents() {
    try {
      this.client.on('connect', () => log.blue(CLIENT_EVENTS.CONNECT));
      this.client.on('ready', () => log.green(CLIENT_EVENTS.READY));
      this.client.on('error', (err: Error) => log.red(CLIENT_EVENTS.ERROR, err));
      this.client.on('end', () => log.blue(CLIENT_EVENTS.END));
      this.client.on('reconnecting', () => log.blue(CLIENT_EVENTS.RECONNECTING));
    } catch (err) {
      log.red(CLIENT_EVENTS.BINDING_ERR, err);
    }
  }
}

const redisHelper = Redis.getInstance();
export default redisHelper;
