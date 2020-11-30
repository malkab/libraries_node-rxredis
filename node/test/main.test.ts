import "mocha";

import "webpack";

console.log(`

--------------------------

Mocha testing

--------------------------

`);

// Add test suites here
describe("RxRedis", () => {
  describe("\n\n  --- rxredisqueue.test ---\n", () => require("./tests/rxredisqueue.test"));
});
