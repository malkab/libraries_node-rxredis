import { RxRedis, RxRedisQueue } from "../src/index";

// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

export const redis: RxRedis = new RxRedis();

export const queue: RxRedisQueue = redis.getRxRedisQueue();

// queue.get$<any>()("q")
