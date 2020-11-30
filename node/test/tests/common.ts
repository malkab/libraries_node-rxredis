import { RxRedis, IRedisMessageObject } from "../../src/index";

import * as rx from "rxjs";

/**
 *
 * The Redis.
 *
 */
export const redis: RxRedis = new RxRedis();

/**
 *
 * A blocking Redis for the queue test.
 *
 */
export const bRedis: RxRedis = redis.blockingClone();

/**
 *
 * A class prepared to be store at Redis in RxRedisQueue queues, serialized.
 *
 */
export class RedisMessageObjectExample implements IRedisMessageObject {

  private _a: number;
  get a(): number { return this._a }

  private _b: string;
  get b(): string { return this._b }

  constructor({
      a,
      b,
    }: {
      a: number;
      b: string;
  }) {

    this._a = a;
    this._b = b;

  }

  public serial$(): rx.Observable<any> {

    return rx.of({
      a: this._a,
      b: this._b
    })

  }

  // Here the class does something intense
  public somethingIntense(): number {

    for(let i = 0 ; i < 500000000 ; i++) {

      if(i % 100000000 === 0) console.log(`Task ${this.a}: ${i}`)

    }

    return this.a;

  }

}
