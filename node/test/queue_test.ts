import { RxRedis, RxRedisQueue } from "../src/index";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * This test module explores the right solution for never-ending queue loops to
 * implement with RxRedisQueue.
 *
 */

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
export class RedisMessageObjectExample {

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

  public serial(): any { return { a: this._a, b: this._b } }

  /**
   *
   * Here the class does something intense. This is the logic to be processed at
   * the switchMap of the loop. Errors here are allowed, see the switchMap.
   *
   */
  public somethingIntense$(): rx.Observable<number> {

    // Will cut the connection, producing an very serious error, irrecuperable
    // by the loop
    if (this.a % 15 === 0) bRedis.close();

    // Will throw an error every type a is divisible by 10, and will be handled
    // by the switchMap graceously
    if (this.a % 10 === 0) return rx.throwError(new Error("error at RedisMessageObjectExampler, perfectly handled by the switchMap without affecting the loop"));

    console.log("RedisMessageObjectExample doing something intense");

    return rx.of(this.a).pipe(rxo.delay(500))

  }

}

/**
 *
 * This is the pattern for an error resistant infinite loop.
 *
 */
RxRedisQueue.get$({
  redis: bRedis,
  keys: [ "q0", "q1" ]
}).pipe(

  /**
   *
   * The switchMap will allow for an independent observable to be run. If this
   * observable produces an error, it won't affect the main loop get$ one.
   *
   */
  rxo.switchMap((o: any) => {

    // An error at this point will cut the loop Observable, AVOID!!!
    if (JSON.parse(o[1]).a % 7 === 0) throw new Error("error at loop produced by a bad error in the main switchMap that should be avoided");

    console.log("D: retrieved from queue", o);

    /**
     *
     * Here goes the logic of the message's processing. It has its own
     * catchError independent from the main loop observable, so it will catch
     * errors produced at the logic observable without crashing the loop get$
     * one.
     *
     */
    return new RedisMessageObjectExample(JSON.parse(o[1])).somethingIntense$()
    .pipe(

      // This will reach the next without stoping the loop
      rxo.catchError((o: Error) => rx.of(o.message))

    )

  }),

  // Don't do this either. Let the errors in the main loop observable flow and
  // crash it, they are serious
  // rxo.catchError((o: Error) => whatever),

  // Ensures the repetition of the get$ main loop observable forever
  rxo.repeat()

  // Do not use retry on the main loop. The main loop will fail for very serious
  // reasons like losing the connection to the Redis, and should be handled
  // seriously
  // rxo.retry()

).subscribe(

  /**
   *
   * Here, legitimate results from the logic observable will be processed, as
   * well as any error processing made by its catchError.
   *
   */
  (o: any) => console.log("D: next", o),

  /**
   *
   * Errors from the get$ loop will be processed here, terminating the loop. To
   * restart the loop, another method should be implemented, external to the
   * observable chain.
   *
   */
  (e: Error) => console.log("D: error", e.message),

  () => console.log("D: complete")

)

/**
 *
 * Post messages every second, with increasing integers.
 *
 */
rx.timer(0, 100)
.subscribe(

  (o: number ) => rx.zip(

    RxRedisQueue.set$(redis, "q0",
      JSON.stringify(new RedisMessageObjectExample({ a: o, b: `${o}` }).serial())),

    RxRedisQueue.set$(redis, "q1",
      JSON.stringify(new RedisMessageObjectExample({ a: o, b: `${o}` }).serial()))

  ).subscribe()

)
