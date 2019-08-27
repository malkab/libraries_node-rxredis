import { RxJsRedis } from "./lib/index";

import * as rx from "rxjs";



console.log(`

------------------------------

`);



const r: RxJsRedis = new RxJsRedis("redis");

r.redisError$
.subscribe(

    (n) => console.log(n),

    (error) => console.log("Error", error)

);

rx.concat(

    r.setJSON$("a", { a: 3, b: 78 }),
    r.keys$("*"),
    r.getJSON$("a"),
    r.close$()
    
)
.subscribe(

    (n) => console.log(n),

    (error) => console.log("Error", error),

    () => console.log("COMPLETE")

)
