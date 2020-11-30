import "mocha";

import { expect } from "chai";

import * as rxo from "rxjs/operators";

import { IRedisInfo, RxRedisQueue } from "../../src/index";

import { rxMochaTests } from "@malkab/ts-utils";

import { redis, RedisMessageObjectExample, bRedis } from "./common";

/**
 *
 * Clear the Redis.
 *
 */
describe("Clear the Redis", function() {

  rxMochaTests({

    testCaseName: "Clear the Redis",

    observables: [

      redis.flushall$()

    ],

    assertions: [

      (o: any) => expect(o, "Clear the Redis")
        .to.be.equal("OK")

    ],

    verbose: false

  })

})

/**
 *
 * Initial clients.
 *
 */
describe("Initial clients", function() {

  rxMochaTests({

    testCaseName: "Initial clients",

    observables: [

      redis.info()

    ],

    assertions: [

      (o: IRedisInfo) => expect(o.connected_clients,
        "Initial clients (including the CLI client of tmuxinator")
        .to.be.equal(3)

    ],

    verbose: false

  })

})

/**
 *
 * Create a queue and drop some messages.
 *
 */
describe("Create a queue and drop some messages", function() {

  rxMochaTests({

    testCaseName: "Create a queue and drop some messages",

    observables: [

      RxRedisQueue.set$(redis, "q",
        new RedisMessageObjectExample({ a: 0, b: "0" })),

      RxRedisQueue.set$(redis, "q",
        new RedisMessageObjectExample({ a: 1, b: "1" })),

      RxRedisQueue.set$(redis, "q",
        new RedisMessageObjectExample({ a: 2, b: "2" })),

      RxRedisQueue.set$(redis, "q",
        new RedisMessageObjectExample({ a: 3, b: "3" })),

      // Will check the existing message, close the connection, and fail
      RxRedisQueue.loop$<RedisMessageObjectExample>({
        redis: bRedis,
        keys: "q",
        object: RedisMessageObjectExample
      }).pipe(

        rxo.map((o: any) => {

          // The object with ID 2 will close the connection and the loop
          if (o.object.a === 2) {

            bRedis.close();

          } else {

            return (<RedisMessageObjectExample>o.object).somethingIntense();

          }

        })

      )

    ],

    assertions: [

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(1),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(2),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(3),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(4),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(0),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.equal(1),

      (o: IRedisInfo) => expect(o, "Messages in queue 'q'")
        .to.be.undefined,

      (o: Error) => expect(o.message).to.be.equal("RxRedis error: error brpop at queues q with timeout 0: AbortError: BLPOP can\'t be processed. The connection is already closed.")

    ],

    verbose: true

  })

})

/**
 *
 * Final clients.
 *
 */
describe("Final clients", function() {

  rxMochaTests({

    testCaseName: "Final clients",

    observables: [

      redis.info()

    ],

    assertions: [

      (o: IRedisInfo) => expect(o.connected_clients,
        "Final clients (including the CLI client of tmuxinator")
        .to.be.equal(2)

    ],

    verbose: false

  })

})
