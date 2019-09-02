import { RxRedis } from "./rxredis";

import { RxRedisChannelListener } from "./rxredischannellistener";

import { RxRedisQueue } from "./rxredisqueue";

import * as rx from "rxjs";

import * as _ from "lodash";



export interface IRxRedisDewProfile {

    queues?: string[];

    channelListeners?: string[];

}



export class RxRedisDew {

    /**
     * 
     * The internal non-blocking RxRedis for sending messages.
     * 
     */

    private _rxRedis: RxRedis;



    /**
     * 
     * The implemented profile from the available at the profiles.
     * 
     */

    private _profileName: string;

    get profileName(): string {

        return this._profileName;
        
    }



    /**
     * 
     * The IRxRedisDewProfile loaded.
     * 
     */

    private _profile: IRxRedisDewProfile;

    get profile(): IRxRedisDewProfile {

        return this._profile;

    }



    /**
     * 
     * The profile key for the selected profile.
     * 
     */

    get redisProfileKey(): string {

        return `___rxredisdewprofile___::${this._profileName}`;

    }



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

    constructor(rxRedis: RxRedis, profileName: string, profile: IRxRedisDewProfile = null) {

        // The primary RxRedis has to be non-blocking

        if (rxRedis.allowBlocking) {

            throw new Error("Error: RxRedisDew: main RxRedis instance has to be non-blocking.");
            
        }

        this._rxRedis = rxRedis;

        this._profileName = profileName;

        if (profile) {

            this._profile = profile;

            this._rxRedis.set$(this.redisProfileKey, JSON.stringify(this._profile))
            .subscribe();

        } else {

            this._rxRedis.get$(this.redisProfileKey)
            .subscribe(

                (n) => {

                    if (n === null) {

                        throw new Error(`RxRedisDew: initializing, cannot read profile ${this.redisProfileKey}.`);

                    }

                    this._profile = JSON.parse(n);

                }

            );

        }

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

        if (this._profile.channelListeners.indexOf(channelListenerName) > -1) {

            const ml: RxRedisChannelListener = 
                this._rxRedis.getRxRedisChannelListener();

            ml.subscribe$(channelListenerName)
            .subscribe(next, error, complete);

            this._channelListeners.push(ml);

        } else {

            throw new Error(`RxRedisDew: channel listener ${channelListenerName} does not exists.`);
            
        }

    }



    /**
     * 
     * Publish to a channel.
     * 
     */

    public channelPublish(channelListenerName: string, message: any): void {

        // Check channelListener exists

        const pos: number = this._profile.channelListeners.indexOf(channelListenerName);

        if (pos !== -1) {

            this._rxRedis.publish(channelListenerName, message);

        } else {

            throw new Error(`RxRedisDew: channel listener ${channelListenerName} does not exists.`);
            
        }

    }



    /**
     * 
     * Publish to a queue.
     * 
     */

    public queuePublish(queueName: string, message: any): void {

        // Check channelListener exists

        const pos: number = this._profile.queues.indexOf(queueName);

        if (pos !== -1) {

            this._rxRedis.lpush$(queueName, message).subscribe();

        } else {

            throw new Error(`RxRedisDew: queue ${queueName} does not exists.`);
            
        }

    }



    /**
     * 
     * Establish a queue listener response.
     * 
     */

    public queueSubscribe(
        queueName: string | string[], 
        next: (next: any) => void, 
        error?: (error: any) => void,
        complete?: () => void
    ): void {

        queueName = _.isArray(queueName) ? queueName : [ queueName ];

        error = error ? error : null;

        complete = complete ? complete : null;

        // Check queues exists

        for (const i of queueName) {

            if (this._profile.queues.indexOf(i) === -1) {

                throw new Error(`RxRedisDew: queue ${i} does not exists.`);
                
            }

        }

        const q: RxRedisQueue = this._rxRedis.getRxRedisQueue();

        q.subscribe$(queueName)
        .subscribe(next, error, complete);

        this._queues.push(q);

    }
    
}
