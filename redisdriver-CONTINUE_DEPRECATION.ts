









    // /*

    //     Waits for a BRPOP

    //     key: the list to BRPOP
    //     timeout: optional, defaults to 0

    // */

    // public brpop(key: string[], timeout: number): Promise<any> {

    //     return new Promise<any>((resolve, reject) => {

    //         // Deep copy key and add timeout
    //         let keys: any[] = [];
    //         key.map((x) => { keys.push(x); });
    //         keys.push(timeout);

    //         this._client.brpop(keys,
    //         (err, message) => {

    //             if (err) {
    //                 reject(err);
    //             }

    //             resolve(message);

    //         });

    //     });

    // }



    // /*

    //     Performs a RPUSH

    // */

    // public rpush(key: string, object: any): Promise<number> {

    //     return new Promise<number> ((resolve, reject) => {

    //         this._client.rpush( key, object, (err, message) => {

    //             if (err) { reject(err); }

    //             resolve(message);

    //         });

    //     });

    // }


    // /*

    //     Performs a LPUSH

    // */

    // public lpush(key: string, object: any): Promise<number> {

    //     return new Promise<number> ((resolve, reject) => {

    //         this._client.lpush( key, object, (err, message) => {

    //             if (err) { reject(err); }

    //             resolve(message);

    //         });

    //     });

    // }


    /*

        Deletes a key

    */

    public del(key: string): Promise<number> {

        return new Promise<number> ((resolve, reject) => {

            this._client.del(key, (err, value) => {

                if (err) { reject(err); }

                resolve(value);

            });

        });

    }


    /**
     * 
     * Executes a flushall command.
     * 
     */
    public flushall(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {

            this._client.flushall((err, value) => {

                if (err) { reject(err); }

                resolve(true);

            })

        })

    }


    // /*

    //     Subscribes to a channel

    // */

    // public subscribeJSON(channel: string, callback: any): redis.RedisClient {

    //     this._client.subscribe(channel);

    //     this._client.on("message",
    //         (queue: string, message: string) => {

    //             callback(queue, JSON.parse(message));

    //         }
    //     );

    //     return this._client;

    // }


    // /*

    //     Publish to a channel

    // */

    // public publishJSON(channel: string, message: any) {

    //     this._client.publish(channel, JSON.stringify(message));

    // }


    // /*

    //     LRANGE: gets a range within a list

    // */

    // public lrange(key: string, first: number, last: number): Promise<string[]> {

    //     return new Promise<string[]>((resolve, reject) => {

    //         this._client.lrange(key, first, last, (err, value) => {

    //             if (err) { reject (err); }

    //             resolve(value);

    //         });

    //     });

    // }



    // /*

    //     INCR: increases a numeric key by 1

    // */

    // public incr(key: string): Promise<number> {

    //     return new Promise<number>((resolve, reject) => {

    //         this._client.incr(key, (err, value) => {

    //             if (err) { reject (err); }

    //             resolve(value);

    //         });

    //     });

    // }



    // /*

    //     HINCRBY: increases a tag in a hash by an amount

    // */

    // public async hincrby(key: string, hash: string, amount: number):
    // Promise<number> {

    //     return new Promise<number>((resolve, reject) => {

    //         this._client.hincrby(key, hash, amount, (err, value) => {

    //             if (err) { reject (err); }

    //             resolve(value);

    //         });

    //     });

    // }



    // /*

    //     HINCRBY: increases a tag in a hash by an amount

    // */

    // public async hset(key: string, hash: string, value: string):
    // Promise<number> {

    //     return new Promise<number>((resolve, reject) => {

    //         this._client.hset(key, hash, value, (err, val) => {

    //             if (err) { reject (err); }

    //             resolve(val);

    //         });

    //     });

    // }



    // /*

    //     HGETALL: get a hash map from Redis

    // */

    // public async hgetall(key: string): Promise<any> {

    //     return new Promise<any>((resolve, reject) => {

    //         this._client.hgetall(key, (err, val) => {

    //             if (err) { reject (err); }

    //             resolve(val);

    //         });

    //     });

    // }

}
