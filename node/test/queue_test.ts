import { RxRedis, RxRedisQueue, IRedisMessageObject } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

console.log(`

---------------------------

Queue test, run independently to not interfere with Mocha. Launch with
yarn queue-test

---------------------------

`);


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

// Will check some messages, close the connection, and fail
RxRedisQueue.loop$({
  redis: bRedis,
  keys: "q",
  constructorFunc: (params: any) => new RedisMessageObjectExample(params)
}).pipe(

  rxo.map((o: any) => {

    // The object with ID 2 will close the connection and the loop
    if (o.object.a === 2) {

      bRedis.close();
      return -1;

    } else {

      return (<RedisMessageObjectExample>o.object).somethingIntense();

    }

  })

)
.subscribe(

  (o: any) => console.log("D: next", o),

  (e: Error) => console.log("D: error", e),

  () => console.log("D: complete")

)

console.log("D: jjd");

/**
 *
 * Post messages.
 *
 */
RxRedisQueue.set$(redis, "q",
  new RedisMessageObjectExample({ a: 0, b: "0" })).subscribe();

RxRedisQueue.set$(redis, "q",
  new RedisMessageObjectExample({ a: 1, b: "1" })).subscribe();

RxRedisQueue.set$(redis, "q",
  new RedisMessageObjectExample({ a: 2, b: "2" })).subscribe();

RxRedisQueue.set$(redis, "q",
  new RedisMessageObjectExample({ a: 3, b: "3" })).subscribe();
