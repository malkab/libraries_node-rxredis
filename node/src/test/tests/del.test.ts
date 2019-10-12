import "mocha";

import { expect } from "chai";

import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { RxRedis } from "../../lib/index";



describe("del tests", function() {

    it("del tests", (done) => {

        // Init new RxRedis

        const r: RxRedis = new RxRedis("redis");

        // For getting the concat's results

        const c: any[] = [];


        // Sequence of observables

        rx.concat(

            r.set$("aa", 100),

            r.keys$("*")
            .pipe(

                rxo.map((x: string[]) => {

                    return x.sort();

                })

            ),

            r.mset$("a", 0, "b", 1, "c", 2),

            r.keys$("*")
            .pipe(

                rxo.map((x: string[]) => {

                    return x.sort();

                })

            ),

            r.del$("aa"),

            r.keys$("*")
            .pipe(

                rxo.map((x: string[]) => {

                    return x.sort();

                })

            ),

            r.del$("c", "a"),

            r.keys$("*")
            .pipe(

                rxo.map((x: string[]) => {

                    return x.sort();

                })

            ),

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
                    
                    100,

                    [ "aa" ],

                    "OK",

                    [ 'a', 'aa', 'b', 'c' ],

                    1,

                    [ 'a', 'b', 'c' ],

                    2,

                    [ "b" ],

                    "OK"
                
                ]);

                r.close();

                done();

            }

        );

    });

});
