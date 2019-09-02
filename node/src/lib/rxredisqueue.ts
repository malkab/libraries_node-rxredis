import * as rxredis from "./rxredis";

import * as rx from "rxjs";



/**
 * 
 * This class manages a potentially blocking BRPOP command.
 * 
 */

export class RxRedisQueue {

    /**
     * 
     * Error subject.
     * 
     */

    public redisError$: rx.Subject<Error> = new rx.Subject<Error>();



    /**
     * 
     * Close flag. If set, next loop iteration tries to close the 
     * connection.
     * 
     */

    private _close: boolean = false;



    /**
     * 
     * The Redis client.
     * 
     */

    private _client: rxredis.RxRedis;



    /**
     * 
     * The Redis instance URL.
     */
    
    private _url: string;



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

    public subscribe$(
        keys: string[], 
        timeout?: number
    ): rx.Subject<any> {
        
        timeout = timeout ? timeout : 10;

        // Create the client

        this._client = new rxredis.RxRedis(
            this._pass,
            true,
            this._url,
            this._port,
            this._db
        );

        this._client.redisError$
        .subscribe(

            (nextError) => this.redisError$.next(nextError),

            (error) => this.redisError$.error(error),

            () => {}

        );

        // Create the returning Subject

        const sub: rx.Subject<any> = new rx.Subject<any>();

        // Inner loop function

        const loop = (k: string[], t: number) => {

            if (this._close) {

                this.unsubscribe();

            }

            this._client.brpop$(k, t)
            .subscribe(

                (n) => {

                    if (n) {
                    
                        sub.next(n);

                    }

                    // Reloop

                    loop(keys, timeout);

                }, 
                
                // Intercepting an error here will make the
                // unsubscribe method to always throw an uncatchable
                // error here

                (error) => {},
                
                () => {}
                
            );

        };

        loop(keys, timeout);

        return sub;

    }



    /** 
     * 
     * Unsubscription. CALLING THIS WILL PRODUCE BRPOP TO THROW AN
     * ERROR, THIS IS NORMAL. Use inside a try-catch.
     * 
     */

    public unsubscribe(): void {

        // Complete the inner observable

        this._close = true;

        if (this._client) {
            
            if (this._close) {

                this._client.close();

            }

        }

    }

}
