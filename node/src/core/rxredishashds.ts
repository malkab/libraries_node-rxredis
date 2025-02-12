import * as rxredis from "./rxredis";

import * as rx from "rxjs";

// import * as utils from "@malkab/ts-utils";



/**
 *
 * This class manages a datastore of .
 *
 */

export class RxRedisHashDs {

    /**
     *
     * The Redis client.
     *
     */

    private _client: rxredis.RxRedis;



    /**
     *
     * The name of the collection.
     *
     * @param collectionName
     * @param rxRedis
     *
     */

    private _collectionName: string;



    /**
     *
     * Constructor.
     *
     */

    constructor(collectionName: string, rxRedis: rxredis.RxRedis) {

        this._client = rxRedis;

        this._collectionName = collectionName;

    }



    /**
     *
     * Gets a hash.
     *
     */

    public hgetall$(hash: string): rx.Observable<any> {

        return this._client.hgetall$(this._redisHashKey(hash));

    }



    /**
     *
     * Sets a hash from a complex object.
     *
     */

    public hsetall$(hash: string, object: any): rx.Observable<any> {

        const out: any[] = [];

        for (const i of Object.keys(object)) {

            out.push(i);
            out.push(object[i]);

        }

        return this._client.hmset$(this._redisHashKey(hash), out);

    }



    /**
     *
     * Increment an element by 1.
     *
     */

    public hincr$(hash: string, key: string): rx.Observable<number> {

        return this._client.hincrby$(this._redisHashKey(hash), key, 1);

    }



    /**
     *
     * Increment an element by 1.
     *
     */

    public hincrby$(hash: string, key: string, amount: number): rx.Observable<number> {

        return this._client.hincrby$(this._redisHashKey(hash), key, amount);

    }



    /**
     *
     * Deletes a key.
     *
     */

    public hdel$(hash: string, key: string): rx.Observable<number> {

        return this._client.hdel$(this._redisHashKey(hash), key);

    }

    /**
     *
     * Sets a key.
     *
     */

    public hset$(hash: string, key: string, value: any): rx.Observable<any> {

        return this._client.hset$(this._redisHashKey(hash), key, value);

    }



    /**
     *
     * Get several hashs in the collection.
     *
     */

    public hmgetall$(pattern: string): rx.Observable<any[]> {

        return new rx.Observable<any[]>((o: any) => {

            this._client.keys$(this._redisHashKey(pattern))
            .subscribe(

                (n: string[]) => {

                    const obs: rx.Observable<any>[] =
                      n.map((x: string) => {

                        return this._client.hgetall$(x);

                      })

                    rx.zip(...obs)
                    .subscribe(

                        (values) => {

                            o.next(values);

                            o.complete();

                        }

                    );

                },

                (error) => { throw(error); }

            );

        });

    }



    /**
     *
     * Close.
     *
     * **BEWARE:** close only standalone RxRedisHashDs.
     *
     */

    public close(): void {

        this._client.close();

    }



    /**
     *
     * Gets the matching Redis hash key.
     *
     */

    private _redisHashKey(hash: string): string {

        return `___rxredishashds___::${this._collectionName}::${hash}`;

    }

}
