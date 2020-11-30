import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

// Add test suites here
describe("RxRedis", () => {
  // describe("\n\n  --- rxredis.test ---\n", () => require("./tests/rxredis.test"));
  // describe("\n\n  --- pubsub.test ---\n", () => require("./tests/pubsub.test"));
  describe("\n\n  --- rxredisqueue.test ---\n", () => require("./tests/rxredisqueue.test"));
});
