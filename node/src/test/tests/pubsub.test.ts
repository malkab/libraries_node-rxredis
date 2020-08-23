import { RxRedis } from "../../lib/index";

// This is a quick-and-dirty test file

// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

// A client for subscribing, another for publishing
const cSubscribe: RxRedis = new RxRedis({});
const cPublish: RxRedis = new RxRedis({});

setTimeout(
  () => cSubscribe.subscribe$("test")
    .subscribe(

      (x: any) => {

        console.log("D: next", x);

      },

      (error: any) => {

        console.log("D: error", error);

      },

      () => {

        console.log("D: completed");

      }

    ),

  1000
)

let i: number = 0;

setInterval(
  () => {
    cPublish.publish("test", `A message ${i}`);
    i += 1;
  },
  100
)

setTimeout(
  () => {
    console.log("Unsubscribe: ", cSubscribe.unsubscribe());
  },
  4000
)
