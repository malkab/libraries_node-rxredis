import * as redis from "redis";

import * as rx from "rxjs";


/**
 * 
 * A RxJS interface to Redis.
 * 
 */

export class RxJsRedis {

    /*
    
        Public
    
    */

    /**
     * 
     * Error subject.
     * 
     */

    public redisError$: rx.Subject<Error> = new rx.Subject<Error>();



    /**
     * 
     * Kills the client.
     */

    public close$(): rx.Observable<boolean> {

        return new rx.Observable<boolean>((o: any) => {

            try {

                this._client.quit();

                o.next(true);

                o.complete();

            } catch (error) {

                o.error(new Error(`RxJsRedis error: error closing Redis client: ${error}`);

                o.complete();

            }

        });

    }



    /**
     * 
     * Sets a JSON.
     * 
     */

    public setJSON$(key: string, json: any): rx.Observable<string> {

        return new rx.Observable<string>((o: any) => {

            const j: string = JSON.stringify(json);

            this._client.set(key, j,
            
                (error, result) => {

                    if (error) { 
                        
                        o.error(new Error(`RxJsRedis error: error setting key ${key} to ${j}: ${error}`));
                        
                        o.complete();
                    
                    }

                    o.next(j);

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
                        
                        o.error(new Error(`RxJsRedis error: error getting keys ${key}: ${error}`));
                    
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
     * Gets a key that is treated as a JSON.
     * 
     */

    public getJSON$(key: string): rx.Observable<any> {

        return new rx.Observable<any>((o: any) => {

            this._client.get(key, 
                
                (error: any, result: string) => {

                if (error) {

                    o.error(new Error(`RxJsRedis error: error getting JSON ${key}: ${error}`));

                    o.complete();

                }

                o.next(JSON.parse(result));

                o.complete();

            });

        });

    }
    




    /*

       Private.

    */



    /**
     * 
     * The Redis instance URL.
     */
    
    private _url: string;

    get url(): string {

        return this._url;

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
     * Constructor.
     *
     */
    
    constructor(
        password: string,
        url?: string, 
        port?: number,
        db?: number
    ) {

        this._url = url ? url : "redis://localhost";
        this._pass = password;
        this._port = port ? port : 6379;
        this._db = db ? db : 0;

        this._client = redis.createClient(this._url, 
            { 
                password: this._pass, 
                db: this._db, 
                port: this._port 
            }
        );

        // Publish the error

        this._client.on("error", (err: Error) => {
            
            this.redisError$.error(err);

        });

    }


}
