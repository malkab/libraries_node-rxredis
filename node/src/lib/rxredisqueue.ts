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
   * The Redis client pool. This is created because multiple blocking
   * operations can be launched at the same time. Don't forget to close
   * this object.
   *
   */
  private _client: RxRedis[] = [];

  /**
   *
   * The base connection.
   *
   */
  private _redisConnection: RxRedis;

  /**
   *
   * Constructor.
   *
   */
  constructor(redisConnection: RxRedis) {

    this._redisConnection = redisConnection;

  }

  /**
   *
   * Publish to the queue.
   *
   * @param keys
   *
   * @param timeout
   */
  public lset$(queueName: string, message: any): rx.Observable<any> {

    return this._redisConnection.lpush$(queueName, message);

  }

  /**
   *
   * Publish to the queue.
   *
   * @param keys
   *
   * @param timeout
   */
  public rset$(queueName: string, message: any): rx.Observable<any> {

    return this._redisConnection.rpush$(queueName, message);

  }

  /**
   *
   * Perform a standard set (from the right), to use in conjuntion with get$.
   *
   */
  public set$(queueName: string, message: any): rx.Observable<any> {

    return this.rset$(queueName, message);

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
  public rget$(
      keys: string | string[],
      numberOfItems: number = null,
      batchLength: number = 1,
      timeout: number = 0
  ): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    // Create the client and push it to the client array to close
    // all of them (MEMORY LEAKS AHEAD)
    const _c: RxRedis = new RxRedis(

      this._redisConnection.connectionParams

    );

    this._client.push(_c);

    // Create the observable

    return new rx.Observable<any>(

      (observer: any) => {

        _c.brpop$(k, timeout)
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
  public lget$(
    keys: string | string[],
    numberOfItems: number,
    batchLength: number = 1,
    timeout: number = 0
  ): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    // Create the client

    const _c: RxRedis = new RxRedis(

      this._redisConnection.connectionParams

    );

    this._client.push(_c);

    // Create the observable

    return new rx.Observable<any>(

      (observer: any) => {

        _c.blpop$(k, timeout)
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
  public get$(keys: string | string[], numberOfItems: number,
    batchLength: number, timeout: number): rx.Observable<any> {

      return this.lget$(keys, numberOfItems, batchLength, timeout);

  }

  /**
   *
   * Unsubscription. CALLING THIS WILL PRODUCE BRPOP TO THROW AN
   * ERROR, THIS IS NORMAL. Use inside a try-catch.
   *
   */
  public close(): void {

    // Drop all connections
    for(const i of this._client) {

      i.close();

    }

  }

}
