import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { RxRedis } from "../../src/index";

describe("RxRedis", function() {

  it("RxRedis set$ / get$ / del$", (done) => {

    const r: RxRedis = new RxRedis({});


    // Sequence of observables

    r.flushall$()
    .pipe(

      rxo.concatMap((n: any) => {

        expect(n, "Starting flushall$").to.be.equal("OK");

        return r.set$("A", 100);

      }),

      rxo.concatMap((n: any) => {

        expect(n, "First set$").to.be.equal(100);

        return r.get$("A");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "get$").to.be.equal("100");

        return r.set$("B", 200);

      }),

      rxo.concatMap((n: any) => {

        expect(n, "Second set$").to.be.equal(200);

        return r.del$("B");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "del$").to.be.equal(1);

        return r.flushall$()

      })

    )
    .subscribe(

      // Will only check the last concatMap

      (n: any) => {

        expect(n, "Final flushall$").to.be.equal("OK");

      },

      (error: any) => {

        throw error;

      },

      // Check results at the end and clean up

      () => {

        r.close();

        done();

      }

    )

  });



  it("RxRedis lpush$ / llen$ / lpop$", (done) => {

    const r: RxRedis = new RxRedis({});


    // Sequence of observables

    r.flushall$()
    .pipe(

      rxo.concatMap((n: any) => {

        expect(n, "Starting flushall$").to.be.equal("OK");

        return r.lpush$("A0", [ 100, 200, 300 ]);

      }),

      rxo.concatMap((n: any) => {

        expect(n, "lpush$").to.be.equal(3);

        return r.llen$("A0");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "First llen$").to.be.equal(3);

        return r.lpop$("A0");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "First lpop$").to.be.equal("300");

        return r.llen$("A0");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "Second llen$").to.be.equal(2);

        return r.lpop$("A0");

      }),

      rxo.concatMap((n: any) => {

        expect(n, "Second lpop$").to.be.equal("200");

        return r.flushall$();

      })

    )
    .subscribe(

      // Will only check the last concatMap

      (n: any) => {

        expect(n, "Final flushall$").to.be.equal("OK");

      },

      (error: any) => {

        throw error;

      },

      // Check results at the end and clean up

      () => {

        r.close();

        done();

      }

    )

  });

});
