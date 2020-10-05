import "mocha";

import { expect } from "chai";

import * as rxo from "rxjs/operators";

import { RxRedis, RxRedisQueue } from "../../lib/index";

import * as rx from "rxjs";



describe("Queues", function() {

  it("set$ / get$", (done) => {

    // The Redis connection and the queue controller

    const r: RxRedis = new RxRedis({});

    const q: RxRedisQueue = r.getRxRedisQueue();

    // Observable output collectors for COMPLETED step analysis

    const popResults: any[] = [];

    const ranges: any[] = [];


    // Start by reseting the Redis

    r.flushall$()
    .pipe(

      // rset$ some values to q

      rxo.concatMap((x: any) => {

        expect(x, "Initial flushall$").to.be.equal("OK");

        return q.rset$("q", [ 0, 1, 2, 3, 4, 5 ]);

      }),

      // Check there they are

      rxo.concatMap((x: any) => {

        expect(x, "First rset$").to.be.equal(6);

        return r.lrange$("q", 0, 100);

      }),

      // lset$ some more ones

      rxo.concatMap((x: any) => {

        expect(x, "First lrange$")
        .to.be.deep.equal([ "0", "1", "2", "3", "4", "5" ]);

        return q.lset$("q", [ 10, 20, 30, 40 ]);

      }),

      // Check they entered the right way

      rxo.concatMap((x: any) => {

        expect(x, "First lset$").to.be.equal(10);

        return r.lrange$("q", 0, 100);

      }),

      // Add some items to a second list

      rxo.concatMap((x: any) => {

        expect(x, "Second lrange$")
        .to.be.deep.equal([ 
          "40", "30", "20", "10", "0", "1", "2", "3", "4", "5" 
        ]);

        return q.rset$("t", [ "A" ]);

      }),

      // Check they entered the right way

      rxo.concatMap((x: any) => {

        expect(x, "lset$ into t").to.be.equal(1);

        return r.lrange$("t", 0, 100);

      }),

      // Get two elements by right in the two lists
      // The interaction of this observable with the next one is 
      // complex to time, but in the end it works. Combined together
      // two elements on both sides will be get

      rxo.concatMap((x: any) => {

        expect(x, "lrange$ over t")
        .to.be.deep.equal([ "A" ]);

        return q.rget$([ "t", "q" ], 2);

      }),

      // Get one element by left. Combined with the last Observable
      // running twice, this will also be run twice.
      // The result of the previous rget$ will be cached

      rxo.concatMap((x: any) => {

        popResults.push(x);

        return q.lget$("q", 1);

      }),

      // Check the status of the list
      // The result of the last lget$ will be cached

      rxo.concatMap((x: any) => {

        popResults.push(x);

        return r.lrange$("q", 0, 100);

      }),

      // This is the real last code to be executed when the main
      // Observable chain analysis is completed in the subscribe block

      rxo.finalize(() => {

        r.flushall$().subscribe(

          (x: any) => {

            expect(x, "Final flushall$").to.be.equal("OK");

            // Close all and exit

            r.close();

            q.close();
    
            done();

          }

        )

      })

    )
    .subscribe(

      (x: any) => {

        // Results of the last lrange$ reach here to be cached

        ranges.push(x);

      },

      (error: any) => {

        // Error catching

        r.close();

        q.close();

        done(error);

      },

      () => {

        // This is the complete of the main sequence, where cached 
        // results are analyzed. Remember that the cleanup will be
        // performed in the rxo.finalize.

        expect(popResults, "popResults final analysis")
        .to.be.deep.equal([
          [ 't', 'A' ], 
          [ 'q', '40' ], 
          [ 'q', '5' ], 
          [ 'q', '30' ]
        ]);

        expect(ranges, "ranges final analysis")
        .to.be.deep.equal([ 
          [ '30', '20', '10', '0', '1', '2', '3', '4' ],
          [ '20', '10', '0', '1', '2', '3', '4' ]
        ]);

      }

    )

  });

})