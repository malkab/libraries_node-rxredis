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
  public somethingIntense$(): rx.Observable<number> {

    if (this.a === 250) return rx.throwError(new Error("error at RedisMessageObjectExampler"));

    console.log("RedisMessageObjectExample doing something intense");

    return rx.of(this.a).pipe(rxo.delay(500))

  }

}

// // Will check some messages, close the connection, and fail
// RxRedisQueue.loop$({
//   redis: bRedis,
//   keys: "q",
//   constructorFunc: (params: any) => new RedisMessageObjectExample(params)
// }).pipe(

//   rxo.concatMap((o: any) => {

//     return o.object.somethingIntense$();

//   })

// ).subscribe(

//   (o: any) => console.log("D: next", o),

//   (e: Error) => console.log("D: error", e.message),

//   () => console.log("D: complete")

// )

RxRedisQueue.lget$({
  redis: bRedis,
  keys: "q"
}).pipe(

  rxo.concatMap((o: any) => {

    return new RedisMessageObjectExample(JSON.parse(o[1])).somethingIntense$()

  }),

  rxo.repeat()

).subscribe(

  (o: any) => console.log("D: next", o),

  (e: Error) => { console.log("D: error", e.message); process.exit(-1); },

  () => console.log("D: complete")

)


/**
 *
 * Post messages.
 *
 */
rx.timer(10, 10)
.subscribe(

  (o: number) => RxRedisQueue.set$(redis, "q",
    new RedisMessageObjectExample({ a: o, b: `${o}` })).subscribe()

)

// RxRedisQueue.set$(redis, "q",
//   new RedisMessageObjectExample({ a: 1, b: "1" })).subscribe();

// RxRedisQueue.set$(redis, "q",
//   new RedisMessageObjectExample({ a: 2, b: "2" })).subscribe();

// RxRedisQueue.set$(redis, "q",
//   new RedisMessageObjectExample({ a: 3, b: "3" })).subscribe();
// }
