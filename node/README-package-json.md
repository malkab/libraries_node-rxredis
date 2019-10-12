# package.json Scripts

Main targets:

-   **start:** runs and watch the Mocha tests at src/test;

-   **quick-test:** runs and watch the src/test/00-quick-test.ts script
    for quick testing;

-   **build:** builds the distribution library for NPM publishing;

-   **clean:** clean dev and distributions builds.



## Service Scripts

These aren't meant to be run directly, but a documentation hasn't harmed
anybody so far:

-   **service:build-lib:** launch the Webpack production processing of
    the library;

-   **service:build:** builds the library and the quick test for
    development;

-   **service:watch:quick-test:server:** nodemons the execution of
    00-quick-test.js;

-   **service:watch:mocha:server:** nodemons the execution of mocha.js;

-   **service:builddocs:html:** builds the HTML doc;

-   **service:builddocs:markdown:** builds the Markdown doc;

-   **service:builddocs:** builds all docs.
