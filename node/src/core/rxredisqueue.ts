import { RxRedis } from "./rxredis";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { IRedisMessageObject } from './iredismessageobject';

/**
 *
 * This class manages a potentially blocking BRPOP command, used to implement
 * message queues.
 *
 * To pass objects using the queues managed by this class they must implement
 * the IRedisMessageObject interface, that forces the definition of a
 * **serial$() => rx.Observable<any>** method to serialize the object. The
 * output of this serialization method must be compatible with the deconstructed
 * constructor of the class to be pass as messages. The methods of this class
 * handle (de)serialization by themselves.
 *
 * To use the methods of this class, a blocking-allowed Redis connection must be
 * provided as parameter. Blocking versions of existing non-blocking connections
 * can be obtained by calling **RxRedis.blockingClone()**. If the connection is
 * closed, any queue loop using it will die.
 *
 * A small example:
 *
 * ```TypeScript
 * import { RxRedis, RxRedisQueue, IRedisMessageObject } from "@malkab/rxredis";
 *
 * const r: RxRedis = new RxRedis({});
 * const br: RxRedis = r.blockingClone();
 *
 * class RedisMessageObjectExample implements IRedisMessageObject {
 *
 *   private _a: number;
 *   get a(): number { return this._a }
 *
 *   private _b: string;
 *   get b(): string { return this._b }
 *
 *   constructor({
 *       a,
 *       b,
 *     }: {
 *       a: number;
 *       b: string;
 *   }) {
 *
 *     this._a = a;
 *     this._b = b;
 *
 *   }
 *
 *   public serial$(): rx.Observable<any> {
 *
 *     return rx.of({
 *       a: this._a,
 *       b: this._b
 *     })
 *
 *   }
 *
 * }
 *
 * // This will read a single message, close the connection, and fail
 * RxRedisQueue.loop$<RedisMessageObjectExample>({
 *   redis: br,
 *   keys: "q",
 *   object: RedisMessageObjectExample
 * }).pipe(
 *   rxo.map((o: any) => {
 *     br.close();
 *     return o;
 *   })
 * )
 *
 * // Send a message
 * RxRedisQueue.set$(redis, "q",
 *  new RedisMessageObjectExample({ a: 0, b: "0" }));
 * ```
 *
 * Don't forget to close() if applicable because it can potentially lead to dead
 * connections to the Redis and memory leaks.
 *
 */
export class RxRedisQueue {

  /**
   *
   * Publish to the queue, on the left. This is a primitive function, use
   * **set$** as a general basis.
   *
   * @param redis
   * The Redis connection.
   *
   * @param queue
   * Name of the queue to publish to.
   *
   * @param message
   * An unopinionated message. Raw, will be published as-is.
   *
   * @returns
   * An observable with the result of the **lpush** operation.
   *
   */
  public static lset$(redis: RxRedis, queue: string, message: any):
  rx.Observable<any> {

    return redis.lpush$(queue, message);

  }

  /**
   *
   * Publish to the queue, on the right. This is a primitive function, use
   * **set$** as a general basis.
   *
   * @param redis
   * The Redis connection.
   *
   * @param queue
   * Name of the queue to publish to.
   *
   * @param message
   * An unopinionated message. Raw, will be published as-is.
   *
   * @returns
   * An observable with the result of the **rpush** operation.
   *
   */
  public static rset$(redis: RxRedis, queue: string, message: any):
  rx.Observable<any> {

    return redis.rpush$(queue, message);

  }

  /**
   *
   * Perform a standard set (from the right), to use in conjuntion with loop$.
   *
   * @param redis
   * The Redis connection to sent the message to.
   *
   * @param queue
   * The name of the queue to send the message to.
   *
   * @param message
   * An **IRedisMessageObject** compatible object. The **serial$** method of the
   * object will be called for serialization at the queue.
   *
   * @returns
   * An observable with the result of the **rpush** operation, that is, the
   * number of elements in the queue.
   *
   */
  public static set$(
    redis: RxRedis,
    queue: string,
    message: IRedisMessageObject
  ): rx.Observable<number> {

    // Serialize the object
    return message.serial$()
    .pipe(

      // Catch serialization errors
      rxo.catchError((e: Error) => {

        throw new Error(`error serializing object at RxRedisQueue set: ${e}`);

      }),

      // Push the serialization
      rxo.concatMap((o: any) => redis.rpush$(queue, JSON.stringify(o)))

    )

  }

  /**
   *
   * Starts blocking left pop of a Redis list (**blpop**).
   *
   * **REMEMBER:** This method **BLOCKS** the connection. Use a
   * completely dedicated RxRedis instance to use it. A blocking clone of an existing Redis connection
   * can be retrieved with RxRedis.blockingClone().
   *
   * @param redis
   * The blocking connection to launch the operation on.
   *
   * @param keys
   * Keys' names to retrieve message from, in order.
   *
   * @param buffer
   * Optional, defaults to 1. Wait for that number of messages to be retrieved.
   *
   * @param timeout
   * Optional. The timeout, defaults to 0 (waiting forever).
   *
   * @returns
   * An observable that waits for a message.
   *
   */
  public static rget$({
      redis,
      keys,
      buffer = 1,
      timeout = 0
    }: {
      redis: RxRedis;
      keys: string | string[];
      buffer: number;
      timeout: number;
  }): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    return redis.brpop$(k, timeout)
    .pipe(

      rxo.repeat(buffer),

      rxo.bufferCount(buffer),

      rxo.map((x: any) => {

        return x.length === 1 ? x[0] : x

      })

    )

  }

  /**
   *
   * Starts blocking left pop of a Redis list (**blpop**).
   *
   * **REMEMBER:** This method **BLOCKS** the connection. Use a
   * completely dedicated RxRedis instance to use it. A blocking clone of an existing Redis connection
   * can be retrieved with RxRedis.blockingClone().
   *
   * @param redis
   * The blocking connection to launch the operation on.
   *
   * @param keys
   * Keys' names to retrieve message from, in order.
   *
   * @param buffer
   * Optional, defaults to 1. Wait for that number of messages to be retrieved.
   *
   * @param timeout
   * Optional. The timeout, defaults to 0 (waiting forever).
   *
   * @returns
   * An observable that waits for a message.
   *
   */
  public static lget$({
      redis,
      keys,
      buffer = 1,
      timeout = 0
    }: {
      redis: RxRedis;
      keys: string | string[];
      buffer?: number;
      timeout?: number;
  }): rx.Observable<any> {

    const k: string[] = Array.isArray(keys) ? keys : [ keys ];

    return redis.blpop$(k, timeout)
    .pipe(

      rxo.repeat(buffer),

      rxo.bufferCount(buffer),

      rxo.map((x: any) => {

        return x.length === 1 ? x[0] : x

      })

    )

  }

  /**
   *
   * This method starts a never ending loop of message retrieving on the given
   * key list. Returns an observable that must be subscribed to process
   * messages. It uses a blocking, dedicated Redis connection to block the
   * retrieval of messages. The only way to stop the loop is to close the
   * blocking Redis connection, that will output an error in the observable
   * returned by this method. Use in conjunction with **set$** to push messages
   * to the queue. The type **T** must inherit the interface
   * **IRedisMessageObject**, and this method will care about the instantiation
   * of serialized messages on the object class given by the **object** param.
   *
   * @param redis
   * A blocking Redis connection to wait for messages on. This connection must
   * be used exclusively for this method. A blocking connection can be easily
   * derived from an existing connection by calling **RxRedis.blockingClone()**.
   *
   * @param keys
   * Set of keys, in order, to look for messages. Can be a single one or an
   * array.
   *
   * @param constructorFunc
   * A function that returns an instance of the correct object when a
   * serialization is retrieved from the RedisMessage. This is the place to run
   * factories for polymorphic objects.
   *
   * @param buffer
   * Optional, defaults to 1. Number of messages to retrieve as a set.
   *
   * @param timeout
   * Optional, defaults to 0. Timeout to wait for messages. 0 means forever.
   *
   * @returns
   * An observable returning a single or an array of the following data
   * structure:
   *
   * ```TypeScript
   * { queue: string; object: T }
   * ```
   *
   * where **queue** is the queue the message was found on and **object** the
   * serialized message object.
   *
   */
  public static loop$({
      redis,
      keys,
      constructorFunc,
      buffer = 1,
      timeout = 0
    }: {
      redis: RxRedis;
      keys: string | string[];
      constructorFunc: (params: any) => any;
      buffer?: number;
      timeout?: number;
  }): rx.Observable<{ queue: string; object: any }[] | { queue: string; object: any }> {

    return RxRedisQueue.lget$({
      redis: redis,
      keys: keys,
      buffer: buffer,
      timeout: timeout
    }).pipe(

      rxo.map((o: any) => {

        // Check if o is a multi response produced by numberOfItems
        const om: any[] = (Array.isArray(o[0])) ? o : [ o ];

        const out: { queue: string; object: any }[] = [];

        om.map((i: any) => out.push({
          queue: i[0],
          object: constructorFunc(JSON.parse(i[1]))
        }))

        return out.length === 1 ? (out[0]) : out;

      }),

      rxo.repeat()

    )

  //   return new rx.Observable<{ queue: string; object: any }[] | { queue: string; object: any }>((x: any) => {

  //     const loop = ({
  //         redis,
  //         keys,
  //         constructorFunc,
  //         buffer = 1,
  //         timeout = 0
  //       }: {
  //         redis: RxRedis;
  //         keys: string | string[];
  //         constructorFunc: (params: any) => any;
  //         buffer?: number;
  //         timeout?: number;
  //     }) => {

  //       RxRedisQueue.lget$({
  //         redis: redis,
  //         keys: keys,
  //         buffer: buffer,
  //         timeout: timeout
  //       })
  //       .subscribe(

  //         (o: any) => {

  //           // Check if o is a multi response produced by numberOfItems
  //           const om: any[] = (Array.isArray(o[0])) ? o : [ o ];

  //           const out: { queue: string; object: any }[] = [];

  //           om.map((i: any) => out.push({
  //             queue: i[0],
  //             object: constructorFunc(JSON.parse(i[1]))
  //           }))

  //           out.length === 1 ? x.next(out[0]) : x.next(out);

  //           loop({
  //             redis: redis,
  //             keys: keys,
  //             constructorFunc,
  //             buffer: buffer,
  //             timeout: timeout
  //           });

  //         },

  //         (e: Error) => {

  //           if (e.message.split(":")[3] === " BLPOP can't be processed. The connection is already closed.") {

  //             x.error(new Error("RxRedis loop$: the connection is already closed, terminating loop"));

  //           } else {

  //             x.next(new Error(`RxRedis loop$: unexpected error: ${e.message}`));

  //             loop({
  //               redis: redis,
  //               keys: keys,
  //               constructorFunc,
  //               buffer: buffer,
  //               timeout: timeout
  //             });

  //           }

  //         }

  //       )

  //     }

  //     loop({
  //       redis: redis,
  //       keys: keys,
  //       constructorFunc,
  //       buffer: buffer,
  //       timeout: timeout
  //     });

  //   })

  }

}
