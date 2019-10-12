import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { RxRedis } from "../../lib/index";



describe("get tests", function() {

    it("get no result", (done) => {

        // Init new RxRedis

        const r: RxRedis = new RxRedis("redis");

        // For getting the concat's results

        const c: any[] = [];


        // Sequence of observables

        rx.concat(

            r.flushall$(),

            r.get$("aa"),

            r.flushall$()

        )
        .subscribe(

            // Results are being stored at c

            (n) => {

                c.push(n);

            },

            (error) => {

                throw error;

            },

            // At the end, we assert the whole array of results
            // and invoke done() to close the test

            () => {

                expect(c).to.deep.equal([ 
                    
                    "OK",

                    null,

                    "OK"
                
                ]);

                r.close();

                done();

            }

        );

    });

});
