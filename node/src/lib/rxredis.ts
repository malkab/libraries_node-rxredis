import * as redis from "redis";

import * as rx from "rxjs";

import * as utils from "@malkab/ts-utils";

import * as _ from "lodash";

import { RxRedisQueue } from "./rxredisqueue";

import { RxRedisHashDs } from "./rxredishashds";



/**
 * 
 * A RxJS interface to Redis.
 * 
 */

export class RxRedis {

    /**
     * 
     * The Redis instance URL.
     */
    
    private _url: string;



    /**
     *
     * Tells if this RxRedis object is allowed to perform blocking
     * operations.
     * 
     */

    private _allowBlocking: boolean;

    get allowBlocking(): boolean {

        return this._allowBlocking;

    }



    /**
     * 
     * The Redis instance port.
     * 
     */
    
    private _port: number;



    /**
     * 
     * The Redis instance password.
     * 
     */

    private _pass: string;



    /**
     * 
     * The Redis instance database. Defaults to 0.
     * 
     */

    private _db: number;



    /**
     * 
     * The Redis client.
     * 
     */

    private _client: redis.RedisClient;



    /**
     *
     * Returns the connection details.
     *  
     */

    get connectionParams() {

      return {

        password: this._pass,
        allowBlocking: this._allowBlocking,
        url: this._url,
        port: this._port,
        db: this._db

      }
    }



    /**
     *
     * Constructor.
     * 
     * allowBlockign by default.
     *
     */
    
    constructor({
      password = "redis",
      allowBlocking = true,
      url = "redis://localhost",
      port = 6379,
      db = 0
    }:
    {
      password?: string,
      allowBlocking?: boolean,
      url?: string, 
      port?: number,
      db?: number
    }) {

      this._url = url;
      this._pass = password;
      this._port = port;
      this._db = db;
      this._allowBlocking = allowBlocking;

      const connectionParams: any = {

        db: db,
        port: port

      };

      if (password) {

        connectionParams.password = password

      }

      try {
      
        this._client = redis.createClient(this._url, connectionParams);

      } catch(err) {

        throw err;

      }

      // Publish the error

      this._client.on("error", (err: Error) => {
        
        throw err;

      });

    }



    /**
     * 
     * Kills the client.
     * 
     */

    public close(): void {

        this._client.quit();

    }



    /**
     * 
     * Sets a JSON.
     * 
     */

    public set$(key: string, value: any): rx.Observable<string> {

      return new rx.Observable<string>((o: any) => {

        this._client.set(key, value,
        
          (error, result) => {

            if (error) { 
                
                o.error(new Error(`RxRedis error: error setting key ${key} to ${value}: ${error}`));
                
                o.complete();
            
            }

            o.next(value);

            o.complete();

          }
            
        );

      });

    }



  /**
   * 
   * LLEN: returns the lenght of a list.
   * 
   * @param key         The key of the list.
   * @returns           An Observable with the result.
   * 
   */

  public llen$(key: string): rx.Observable<number> {

    return new rx.Observable<number>((o: any) => {

      this._client.llen(key, 
      
        (error, result) => {

          if (error) {

            o.error(new Error(`RxRedis error: error llen ${key}: ${error}`));

            o.complete();

          }

          o.next(result);

          o.complete();

        }
        
      );

    })
  
  }



  /**
   * 
   * LPOP: left pops a value from a list.
   * 
   * @param key         The key of the list.
   * @returns           An Observable with the result.
   * 
   */

  public lpop$(key: string): rx.Observable<any> {

    return new rx.Observable<any>((o: any) => {

      this._client.lpop(key, 
      
        (error, result) => {

          if (error) {

            o.error(new Error(`RxRedis error: error lpop ${key}: ${error}`));

            o.complete();

          }

          o.next(result);

          o.complete();

        }
        
      );

    })
  
  }



    /**
     * 
     * MSET
     * 
     */

    public mset$(...keysValues: any[]): rx.Observable<string> {

        return new rx.Observable<string>((o: any) => {

            this._client.mset(keysValues,
            
                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error mset ${keysValues}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }
                
            );

        });

    }



    /**
     * 
     * Get keys.
     * 
     */
       
    public keys$(key: string): rx.Observable<string[]> {

        return new rx.Observable<string[]>((o: any) => {

            this._client.keys(key,
            
                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error getting keys ${key}: ${error}`));
                    
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }
                
            );

        });

    }



    /**
     * 
     * Gets a key.
     * 
     */

    public get$(key: string): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.get(key, 
                
                (error: any, value: string) => {

                if (error) {

                    o.error(new Error(`RxRedis error: get$ ${key}: ${error}`));

                    o.complete();

                }

                o.next(value);

                o.complete();

            });

        });

    }
    



  /*

      Waits for a BLPOP

      key: the list(s) to BLPOP
      timeout: optional, defaults to 0

  */

  public blpop$(
    keys: string[],  
    timeout: number = 0
  ): rx.Observable<any> {

    if (this._allowBlocking) {

      return new rx.Observable<any>((o: any) => {

        const params: any[] = _.cloneDeep(keys);

        // Add the timeout to the keys

        params.concat(keys);

        params.push(timeout);

        // Run the brpop

        this._client.blpop(params,

          (error, value) => {

            if (error) {

              o.error(new Error(`RxRedis error: error brpop at queues ${keys} with timeout ${timeout}: ${error}`));

              o.complete();

            }

            o.next(value);

            o.complete();

          }

        );

        return () => {};

      });

    } else {

      throw this._blockingError("brpop");

    }

  }






    /*

        Waits for a BRPOP

        key: the list to BRPOP
        timeout: optional, defaults to 0

    */

    public brpop$(keys: string[], timeout?: number): rx.Observable<any> {

        if (this._allowBlocking) {

            timeout = timeout ? timeout : 0;

            return new rx.Observable<any>((o: any) => {
                
                const params: any[] = _.cloneDeep(keys);

                params.push(timeout);

                this._client.brpop(params,

                    (error, value) => {

                        if (error) {

                            o.error(new Error(`RxRedis error: error brpop at queues ${keys} with timeout ${timeout}: ${error}`));
                            
                            o.complete();

                        }

                        o.next(value);

                        o.complete();

                    }
                    
                );

                return () => {};

            });

        } else {

            throw this._blockingError("brpop");

        }

    }



    public lpush$(key: string, value: any | any[]): rx.Observable<number> {

        return new rx.Observable<number>((o: any) => {

            this._client.lpush(key, value,

                (error, result) => {

                    if (error) {

                        o.error(new Error(`RxRedis error: error lpush value ${value} at ${key}: ${error}`));
                        
                        o.complete();

                    }

                    o.next(result);

                    o.complete();

                }
                
            );

            return () => {};

        });

    }





  public rpush$(key: string, value: any | any[]): rx.Observable<number> {

    return new rx.Observable<number>((o: any) => {

        this._client.rpush(key, value,

            (error, result) => {

                if (error) {

                    o.error(new Error(`RxRedis error: error rpush value ${value} at ${key}: ${error}`));
                    
                    o.complete();

                }

                o.next(result);

                o.complete();

            }
            
        );

        return () => {};

    });

}









    /**
     * 
     * Deletes keys passed as ... params.
     * 
     * Examples:
     * 
     * ```TypeScript
     * del$(key0, key1, key2);
     * 
     * del$(...[key0, key1]);
     * ```
     * 
     * @param keys          A ... param of keys to delete.
     * @returns             An integer with the number of keys deleted
     *                      if everything went well.
     * 
     */

    public del$(...keys: string[]): rx.Observable<number> {

        return new rx.Observable<number>((o: any) => {

            this._client.del(keys,
                
                (error, value) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error deleting keys ${keys}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(value);

                    o.complete();

                }
                
            );

        });

    }



    /**
     * 
     * Executes a flushall command. Returns true if everything went well.
     * 
     */

    public flushall$(): rx.Observable<boolean> {

      return new rx.Observable<boolean>((o: any) => {

        this._client.flushall((error, result) => {

          if (error) { 
            
            o.error(new Error(`RxRedis error: error flushall: ${error}`));
            
            o.complete();
          
          }

            o.next(result);

            o.complete();

        });

      });

    }




    /**
     * 
     * Subscribes to a channel.
     * 
     * **REMEMBER:** This method **BLOCKS** the connection. Use a
     * completely dedicated RxRedis instance to use it.
     * 
     */

    public subscribe$(channel: string): rx.Subject<any> {

        if (this.allowBlocking) {

            const sub: rx.Subject<any> = new rx.Subject<any>();

            this._client.subscribe(channel);

            this._client.on("message",
            
                (c: string, message: any) => {

                    sub.next({ c, message });

                }

            );

            return sub;

        } else {

            throw this._blockingError("subscribe");

        }

    }



    /*

        Publish to a channel

    */

    public publish(channel: string, message: any) {

        this._client.publish(channel, message);

    }



    /*

        LRANGE: gets a range within a list

    */

    public lrange$(key: string, first: number, last: number): rx.Observable<string[]> {

        return new rx.Observable<string[]>((o: any) => {

            this._client.lrange(key, first, last, 
                
                (error, value) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error lrange ${key}, first ${first}, last ${last}: ${error}`));
                    
                        o.complete();
                    
                    }

                    o.next(value);

                    o.complete();

                }
                
            );

        });

    }



    /*

        INCR: increases a numeric key by 1

    */

    public incr$(key: string): rx.Observable<number> {

        return new rx.Observable<number>((o: any) => {

            this._client.incr(key,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error incr ${key}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }




    /*

        HINCRBY: increases a tag in a hash by an amount

    */

    public hincrby$(hash: string, key: string, amount: number):
    rx.Observable<number> {

        return new rx.Observable<number>((o: any) => {

            this._client.hincrby(hash, key, amount,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error hincrby ${key} at hash ${hash} by ${amount}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }




    /*

        HSET: sets a tag at a hash

    */

    public hset$(hash: string, key: string, value: string):
    rx.Observable<number> {

        return new rx.Observable<number>((o: any) => {

            this._client.hset(hash, key, value,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error hset ${key} at hash ${hash} to ${value}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }



    /*

        HGETALL: gets the full hash.

    */

    public hgetall$(hash: string): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.hgetall(hash,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error hgetall ${hash}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }



    /**
     * 
     * HMSET
     * 
     */

    public hmset$(hash: string, value: any[]): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.hmset(hash, value,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error hmset ${hash}, ${value}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }



    /**
     * 
     * HDEL
     * 
     */

    public hdel$(hash: string, key: string): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.hdel(hash, key,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error hdel ${hash}, ${key}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }



    /**
     * 
     * MGET
     * 
     */

    public mget$(...keys: string[]): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.mget(keys,

                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxRedis error: error mget ${keys}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(result);

                    o.complete();

                }

            );

        });

    }



  /**
   * 
   * Gets all the keys with a pattern
   * 
   */

  public getPattern$(pattern: string):
  rx.Observable<Map<string, any>> {

    const out: Map<string, any> = 
    new Map<string, any>();

    return new rx.Observable<Map<string, any>>((o: any) => {
        
      this.keys$(pattern)
      .subscribe(

        (keys: string[]) => {

          // No keys retrieved, return empty map
          if (keys.length === 0) {

            o.next(out);
            o.complete();

          }

          // Get array of observables
          const obs: rx.Observable<any>[] =
            keys.map((x: string) => {

            return this.get$(x)

          })

          rx.zip(...obs)
          .subscribe(

            (values) => {

              for (const i in keys) {

                out.set(keys[i], values[i]);

              }

              o.next(out);
              o.complete();

            },

            (error) => o.error(new Error(`RxRedis error: error getPattern with pattern ${pattern}: ${error}`)),
    
            () => {}

          );

        },

        (error) => o.error(new Error(`RxRedis error: error getPattern with pattern ${pattern}: ${error}`)),
        
        () => {}

      );

    });

  }



    /**
     * 
     * Gets all the hash keys with a pattern
     * 
     */

    public hgetallPattern$(pattern: string):
    rx.Observable<Map<string, any>> {

        return new rx.Observable<Map<string, any>>((o: any) => {
            
            this.keys$(pattern)
            .subscribe(

                (keys: string[]) => {

                    // Get array of observables
                    const obs: rx.Observable<any>[] =
                      keys.map((x: string) => {

                        return this.hgetall$(x)

                      })

                    rx.zip(...obs)
                    .subscribe(

                        (values) => {

                            const out: Map<string, any> = 
                                new Map<string, any>();

                            for (const i in keys) {

                                out.set(keys[i], values[i]);

                            }

                            o.next(out);

                            o.complete();

                        },

                        (error) => o.error(new Error(`RxRedis error: error hgetallPattern with pattern ${pattern}: ${error}`)),
                
                        () => {}

                    );

                },

                (error) => o.error(new Error(`RxRedis error: error hgetallPattern with pattern ${pattern}: ${error}`)),
                
                () => {}

            );

        });

    }



    /**
     * 
     * Returns a RxRedisQueue taking connection parameters of this RxRedis.
     * 
     */

    public getRxRedisQueue(): RxRedisQueue {

        return new RxRedisQueue(this);
        
    }



    // /**
    //  * 
    //  * Returns a RxRedisChannelListener taking connection parameters of
    //  * this RxRedis.
    //  * 
    //  */

    // public getRxRedisChannelListener(): RxRedisChannelListener {

    //     return new RxRedisChannelListener(this._pass, this._url, 
    //         this._port, this._db);
        
    // }



    /**
     * 
     * Returns a RxRedisChannelListener taking connection parameters of
     * this RxRedis.
     * 
     */

    public getRxRedisHashDs(collectionName: string): RxRedisHashDs {

        return new RxRedisHashDs(collectionName, this);
        
    }



    /**
     * 
     * Creates an Error to signal block operation attempted in a
     * non-blocking instance.
     * 
     */

    private _blockingError(command: string): Error {

        return new Error(`RxRedis: blocking command ${command} attempted on a non-blocking instance.`);

    }

}
