import { RxRedis } from "./rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

/**
 *
 * This class manages a potentially blocking BRPOP command, used to
 * implement message queues.
 *
 * To use, just:
 *
 * ```TypeScript
 *
 * const r: RxRedis = new RxRedis({});
 *
 * const q: RxRedisQueue = r.getRxRedisQueue();
 *
 * q.rget$([ "t", "q" ], [ Number of results to get])
 * .subscribe();
 *
 * q.close();
 *
 * r.close();
 * ```
 *
 * where the [ Number of results to get ] is optional for a never-ending
 * event loop.
 *
 * Don't forget to close() if applicable because it can potentially
 * lead to dead connections to the Redis and memory leaks.
 *
 */
export class RxRedisQueue {

  /**
   *
   * Publish to the queue.
   *
   * @param keys
   *
   * @param timeout
   */
  public static lset$(redis: RxRedis, queueName: string, message: any): rx.Observable<any> {

    return redis.lpush$(queueName, message);

  }

  /**
   *
   * Publish to the queue.
   *
   * @param keys
   *
   * @param timeout
   */
  public static rset$(redis: RxRedis, queueName: string, message: any): rx.Observable<any> {

    return redis.rpush$(queueName, message);

  }

  /**
   *
   * Perform a standard set (from the right), to use in conjuntion with get$.
   *
   */
  public static set$(redis: RxRedis, queueName: string, message: any): rx.Observable<any> {

    return redis.rpush$(queueName, message);

  }

  /**
   *
   * Starts a never ending brpop loop.
   *
   * **REMEMBER:** This method **BLOCKS** the connection. Use a
   * completely dedicated RxRedis instance to use it.
   *
   * @param keys              The list of keys to pop from.
   * @param timeout           Optional. The timeout, defaults to 0
   *                          (waiting forever).
   *
   */
  public static rget$({
      redis,
      keys,
      numberOfItems = 1,
      batchLength = 1,
      timeout = 0
    }: {
      redis: RxRedis;
      keys: string | string[];
      numberOfItems: number;
      batchLength: number;
      timeout: number;
  }): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    // Create the observable
    return new rx.Observable<any>(

      (observer: any) => {

        redis.brpop$(k, timeout)
        .pipe(

          rxo.repeat(numberOfItems),

          rxo.bufferCount(batchLength),

          rxo.map((x: any) => {

            return x.length === 1 ? x[0] : x

          })

        )
        .subscribe(

          (n: any) => {

            observer.next(n);

          },

          // Intercepting an error here will make the
          // unsubscribe method to always throw an uncatchable
          // error here

          (error: Error) => {

            throw error;

          },

          () => {

            observer.complete();

          }

        );

      }

    )

  }

  /**
   *
   * Starts a never ending brpop loop.
   *
   * **REMEMBER:** This method **BLOCKS** the connection. Use a
   * completely dedicated RxRedis instance to use it.
   *
   * @param keys              The list of keys to pop from.
   * @param timeout           Optional. The timeout, defaults to 0
   *                          (waiting forever).
   *
   */
  public static lget$({
      redis,
      keys,
      numberOfItems = 1,
      batchLength = 1,
      timeout = 0
    }: {
      redis: RxRedis;
      keys: string | string[];
      numberOfItems: number;
      batchLength: number;
      timeout: number;
  }): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    // Create the observable
    return new rx.Observable<any>(

      (observer: any) => {

        redis.blpop$(k, timeout)
        .pipe(

          rxo.repeat(numberOfItems),

          rxo.bufferCount(batchLength),

          rxo.map((x: any) => {

            return x.length === 1 ? x[0] : x

          })

        )
        .subscribe(

          (n: any) => {

            observer.next(n);

          },

          // Intercepting an error here will make the
          // unsubscribe method to always throw an uncatchable
          // error here
          (error: Error) => {

            throw error;

          },

          () => {

            observer.complete();

          }

        );

      }

    )

  }

  /**
   *
   * Performs a standard get (from the left), to use in conjunction with set$.
   *
   */
  public static loop$<T>(): ({
      redis,
      keys,
      nextFunction,
      errorFunction,
      numberOfItems,
      batchLength,
      timeout
    }: {
      redis: RxRedis;
      keys: string | string[];
      nextFunction: (response: T) => any;
      errorFunction: (error: Error) => any;
      numberOfItems?: number;
      batchLength?: number;
      timeout?: number;
  }) => void {

      const loop: ({
          redis,
          keys,
          nextFunction,
          errorFunction,
          numberOfItems,
          batchLength,
          timeout
        }: {
          redis: RxRedis;
          keys: string | string[];
          nextFunction: (response: T) => any;
          errorFunction: (error: Error) => any;
          numberOfItems?: number;
          batchLength?: number;
          timeout?: number;
      }) => void = ({
          redis,
          keys,
          nextFunction,
          errorFunction,
          numberOfItems = 1,
          batchLength = 1,
          timeout = 0
        }: {
          redis: RxRedis;
          keys: string | string[];
          nextFunction: (response: T) => any;
          errorFunction: (error: Error) => any;
          numberOfItems?: number;
          batchLength?: number;
          timeout?: number;
      }) => {

        RxRedisQueue.lget$({
          redis: redis,
          keys: keys,
          numberOfItems: numberOfItems,
          batchLength: batchLength,
          timeout: timeout
        }).subscribe(

          (o: T) => {

            try {

              nextFunction(o);

            } catch(e) {

              errorFunction(e);

            }

            loop({
              redis: redis,
              keys: keys,
              nextFunction: nextFunction,
              errorFunction: errorFunction,
              numberOfItems: numberOfItems,
              batchLength: batchLength,
              timeout: timeout
            });

          },

          (e: Error) => {

            errorFunction(e);

            loop({
              redis: redis,
              keys: keys,
              nextFunction: nextFunction,
              errorFunction: errorFunction,
              numberOfItems: numberOfItems,
              batchLength: batchLength,
              timeout: timeout
            });

          }

        )

      }

      return loop;

  }

}
