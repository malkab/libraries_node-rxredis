import * as rxredis from "./rxredis";

import * as rx from "rxjs";



export class RxRedisChannelListener {

    /**
     * 
     * Error subject.
     * 
     */

    public redisError$: rx.Subject<Error> = new rx.Subject<Error>();



    /**
     * 
     * The inner observable
     * 
     */

    private _observable: rx.Observable<any>;



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
     * 
     */

    public subscribe$(channel: string): rx.Subject<any> {

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

        return this._client.subscribe$(channel);

    }



    /** 
     * 
     * Unsubscription. CALLING THIS WILL PRODUCE BRPOP TO THROW AN
     * ERROR, THIS IS NORMAL. Use inside a try-catch.
     * 
     */

    public unsubscribe(): void {

        // Complete the inner observable

        if (this._client) {
        
            this._client.close();

        }

    }

}
