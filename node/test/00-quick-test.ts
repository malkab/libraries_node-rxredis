import { RxRedis } from "../lib/index";

// This is a quick-and-dirty test file
// Proper testing must be done with Mocha

console.log(`

---------------------------

Quick Test

---------------------------

`);

// A client
const c: RxRedis = new RxRedis({});

c.info()
.subscribe(

  (o: any) => console.log("D: next", o),

  (error: any) => console.log("D: error", error),

  () => console.log("D: complete")

)
