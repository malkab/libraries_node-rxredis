import { RxRedis, RxRedisQueue, RxRedisChannelListener, RxRedisHashDs, RxRedisDew, IRxRedisDewProfile } from "./lib/index";

import * as rx from "rxjs";



console.log(`

------------------------------

`);



// The main connection, non-blocking

const r00: RxRedis = new RxRedis("redis", false);

r00.redisError$
.subscribe(

    (n) => console.log(n),

    (error) => console.log("Error", error)

);



// An standalone Channel listener, remember that Channel listeners
// returns Subjects

// const m00 = new RxRedisChannelListener("redis");

// const m00Subject$ = m00.subscribe$("channel00");

// m00Subject$
// .subscribe(
//     (n) => console.log("m00: Subscription 00 to channel: ", n),

//     (error) => console.log("Error", error)

// );

// m00Subject$
// .subscribe(
//     (n) => console.log("m00: Subscription 01 to channel: ", (+(n.message))*100),

//     (error) => console.log("Error", error)

// );



// A Channel listener created from r00

// const m01 = r00.getRxRedisChannelListener();

// m01.subscribe$("channel00")
// .subscribe(
//     (n) => console.log("m01: Subscription to channel: ", n),

//     (error) => console.log("Error", error)

// )



// An standalone queue, returns a subject

// const q00: RxRedisQueue = new RxRedisQueue("redis");

// const q00Subject$ = q00.subscribe$( [ "l0", "l1" ]);

// q00Subject$
// .subscribe(

//     (next) => console.log("D: queue 00 subscriber 00", next),

//     (error) => console.log("D: queue 00", error),

//     () => console.log("D: COMPLETE q00")

// );

// q00Subject$
// .subscribe(

//     (next) => console.log("D: queue 00 subscriber 01", next),

//     (error) => console.log("D: queue 00", error),

//     () => console.log("D: COMPLETE q00")

// );



// A queue created from r00

// const q01: RxRedisQueue = r00.getRxRedisQueue();

// const q01Subject$ = q01.subscribe$([ "l0", "l1" ]);

// q01Subject$.subscribe(

//     (next) => console.log("D: queue 01 subscriber 00", next),

//     (error) => console.log("D: queue 01", error),

//     () => console.log("D: COMPLETE q01")

// );

// q01Subject$.subscribe(

//     (next) => console.log("D: queue 01 subscriber 01", next),

//     (error) => console.log("D: queue 01", error),

//     () => console.log("D: COMPLETE q01")

// );



// An standalone RxRedisHashDs

const hash00: RxRedisHashDs = new RxRedisHashDs("hashCol00", new RxRedis("redis"));



// A RxRedisHashDs from RxRedis

const hash01: RxRedisHashDs = r00.getRxRedisHashDs("hashCol01");



rx.concat(

    r00.set$("ajson", JSON.stringify({ a: 3, b: 78 })),
    r00.keys$("*"),
    r00.flushall$(),
    r00.keys$("*")
    // r00.get$("ajson"),
    // r00.del$("ajson"),
    // r00.set$("ajson", 99),
    // r00.lpush$("alist", [ "s00", "s01", "s02", "s03", "s04", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
    // r00.lrange$("alist", 3, 7),
    // r00.incr$("b"),
    // r00.incr$("b"),
    // r00.incr$("b"),
    // r00.get$("b"),
    // r00.hset$("hash_c", "a", "A value"),
    // r00.hset$("hash_c", "b", "10"),
    // r00.hincrby$("hash_c", "b", 5),
    // r00.hset$("hash_d", "a", "Another value"),
    // r00.hset$("hash_d", "b", "20"),
    // r00.hincrby$("hash_d", "b", 5),
    // r00.hgetall$("hash_c"),
    // r00.hgetall$("hash_d"),
    // r00.hdel$("hash_d", "a"),
    // r00.hgetall$("hash_d"),
    // r00.set$("pat_a", 10),
    // r00.set$("pat_b", 20),
    // r00.set$("pat_c", 30),
    // r00.getPattern$("pat_*"),
    // r00.hgetallPattern$("hash_*"),
    // r00.lpush$("l0", [ "s00", "s01", "s02", "s03", "s04", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
    // r00.lpush$("l0", [ "s00", "s01", "s02", "s03", "s04", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
    // r00.lpush$("l0", [ "s00", "s01", "s02", "s03", "s04", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
    // r00.lpush$("l0", [ "s00", "s01", "s02", "s03", "s04", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]),
    // r00.hmset$("hashee", [ "a", 33, "b", 88, "c", JSON.stringify({ a: 2, b: 4 }) ]),
    // hash00.hsetall$("h00", { a: 23, b: 55 }),
    // hash00.hincr$("h00", "a"),
    // hash00.hincrby$("h00", "b", 100),
    // hash00.hgetall$("h00"),
    // hash00.hdel$("h00", "b"),
    // hash00.hset$("h00", "dd", "SOMETHING"),
    // hash00.hgetall$("h00"),
    // hash00.hset$("h01", "a", 900),
    // hash00.hgetall$("h01"),
    // hash00.hmgetall$("h0*"),
    // r00.mset$(...["a", 0, "b", 1, "c", 2]),
    // r00.mget$(...["a", "b", "c"])

)
.subscribe(

    (n) => console.log("r00: Result", n),

    (error) => console.log("r00: Error", error),

    () => {
        
        // Execute the observable logic without doing nothing extra.

        hash00.hset$("h00", "aee", 323).subscribe();

        hash00.hgetall$("h00").subscribe(

            (n) => console.log("h00", n)

        )

        r00.publish("channel00", 34);
        r00.publish("channel00", 332);

        // q00.unsubscribe();
        // q01.unsubscribe();

        // m00.unsubscribe();
        // m01.unsubscribe();

        hash00.close();
        hash01.close();
        
        r00.close();

        console.log("r00: COMPLETE");

    }

);




/*

    -----------------

    DEW testing

    -----------------

*/

// const dewProfile: IRxRedisDewProfile = {

//     queues: [ "q00", "q01", "q02" ],

//     channelListeners: [ "m00", "m01", "m02" ]

// }

// // The main connection, non-blocking

// const r000: RxRedis = new RxRedis("redis", false);

// r000.redisError$
// .subscribe(

//     (n) => console.log(n),

//     (error) => console.log("Error", error)

// );


// let dew01: RxRedisDew; 

// let dew02: RxRedisDew;


// // An standalone Dew

// const dew00: RxRedisDew = new RxRedisDew(new RxRedis("redis", false), "a", dewProfile);

// // A Dew from the common connection

// setTimeout(() => { 
    
//     dew01 = new RxRedisDew(r000, "a"); 

//     dew02 = new RxRedisDew(r000, "a");

// }, 2000);




// setTimeout(() => {

//     // Adding listeners to the m00

//     dew00.channelSubscribe("m00", (n) => console.log("D: listener 000", n));
    
//     dew00.channelSubscribe("m00", (n) => console.log("D: listener 001", n));

//     dew01.channelSubscribe("m00", (n) => console.log("D: listener 010", n));
    
//     dew01.channelSubscribe("m00", (n) => console.log("D: listener 011", n));
    
//     dew02.channelSubscribe("m00", (n) => console.log("D: listener 020", n));
    
//     dew02.channelSubscribe("m00", (n) => console.log("D: listener 021", n));
    

//     dew00.queueSubscribe([ "q00", "q01" ], (n) => console.log("D: queue listener 000", n),
//         (error) => console.log("D: error queue listener 00"));

//     dew00.queueSubscribe([ "q00", "q01" ], (n) => console.log("D: queue listener 001", n),
//         (error) => console.log("D: error queue listener 01"));

//     dew01.queueSubscribe([ "q00", "q01" ], (n) => console.log("D: queue listener 010", n),
//         (error) => console.log("D: error queue listener 00"));

//     dew01.queueSubscribe([ "q00", "q01" ], (n) => console.log("D: queue listener 011", n),
//         (error) => console.log("D: error queue listener 01"));

// }, 3000);


// setTimeout(() => { 
    
//     dew00.channelPublish("m00", "a");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

//     dew00.queuePublish("q00", "kk");
    
//     dew00.queuePublish("q01", "jj");

// }, 4000);


// setTimeout(() => {

//     dew00.close();

//     dew01.close();

//     dew02.close();

//     r000.close();

// }, 5000);
