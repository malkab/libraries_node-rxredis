import { RxRedis } from "../node/src/lib/rxredis";

import { RxRedisChannelListener } from "../node/src/lib/rxredischannellistener";

import { RxRedisQueue } from "../node/src/lib/rxredisqueue";

import * as rx from "rxjs";

import * as _ from "lodash";



export class RxRedisDew {

    /**
     * 
     * The internal non-blocking RxRedis for sending messages.
     * 
     */

    private _rxRedis: RxRedis;



    /**
     * 
     * The set of RxRedisChannelListener.
     * 
     */

    private _channelListeners: RxRedisChannelListener[] = [];



    /**
     * 
     * The set of RxRedisQueues.
     * 
     */

    private _queues: RxRedisQueue[] = [];



    /**
     * 
     * Creates a new instance of Dew.
     * 
     * @param rxRedis       A non-blocking RxRedis instance.
     * @param profileName   The profile name to process from within the
     *                      profiles. If profiles is present, the
     *                      provided profiles will be stored at Redis
     *                      with this name. If not, Dew will look for a
     *                      profile at Redis with this name instead.
     * @param profile       Optional. A Dew profile. If exists, takes
     *                      the profile and post it to the Redis to make
     *                      it available for other instances.
     * 
     */

    constructor(rxRedis: RxRedis) {

      // The primary RxRedis has to be non-blocking

      if (rxRedis.allowBlocking) {

          throw new Error("Error: RxRedisDew: main RxRedis instance has to be non-blocking.");
          
      }

      this._rxRedis = rxRedis;

    }



    /**
     * 
     * Close the connection.
     * 
     */

    public close(): void {

      // Close channelListeners

      for (const i of this._channelListeners) {

          i.unsubscribe();

      }

      for (const i of this._queues) {

          i.unsubscribe();

      }

      this._rxRedis.close();

    }




    /**
     * 
     * Publish to a channel.
     * 
     */

    public channelPublish(channelListenerName: string, message: any): void {

      // Check channelListener exists

      this._rxRedis.publish(channelListenerName, message);

    }


    /**
     * 
     * Establish a channel listener response.
     * 
     */

    public channelSubscribe(
      channelListenerName: string, 
      next: (next: any) => void, 
      error?: (error: any) => void,
      complete?: () => void
    ): void {

      error = error ? error : null;

      complete = complete ? complete : null;

      const ml: RxRedisChannelListener = 
          this._rxRedis.getRxRedisChannelListener();

      ml.subscribe$(channelListenerName)
        .subscribe(next, error, complete);

    }



    /**
     * 
     * Publish to a queue.
     * 
     */

    public queuePublish(queueName: string, message: any): 
    rx.Observable<any> {

      return this._rxRedis.lpush$(queueName, message);

    }



    /**
     * 
     * Establish a queue listener response.
     * 
     */

    public queueSubscribe(
        queueName: string | string[], 
        // next: (next: any) => void, 
        // error?: (error: any) => void,
        // complete?: () => void
    ): rx.Subject<any> {

        queueName = _.isArray(queueName) ? queueName : [ queueName ];

        // error = error ? error : null;

        // complete = complete ? complete : null;

        const q: RxRedisQueue = this._rxRedis.getRxRedisQueue();

        return q.subscribe$(queueName);

        this._queues.push(q);

    }
    
}
