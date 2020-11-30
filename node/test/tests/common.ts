import { RxRedis, RxRedisQueue } from "../../src/index";

/**
 *
 * The Redis.
 *
 */
export const redis: RxRedis = new RxRedis();

export const queue: RxRedisQueue = redis.getRxRedisQueue();

RxRedisQueue.loop$<any>()({
  redis: redis.blockingClone(),
  keys: "q",
  nextFunction: (o: any) => {
    console.log("D: next", o);
    throw new Error("33");
  },
  errorFunction: (o: Error) => console.log("D: error", o)
})

RxRedisQueue.set$(redis, "q", JSON.stringify({ A: 23 })).subscribe();
