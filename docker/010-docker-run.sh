#!/bin/bash

docker run -ti --rm \
    -e NODE_ENV=development \
    -e NODE_MEMORY=2GB \
    --network=container:rxredis-redis-dev \
    --name=rxredis-node-dev \
    -v $(pwd):/ext_src \
    -v $(pwd)/../node/:$(pwd)/../node/ \
    -v ~/.npmrc:/root/.npmrc \
    -v ~/.npmrc:/home/node/.npmrc \
    --entrypoint /bin/bash \
    --workdir $(pwd)/../node/ \
    malkab/nodejs-dev:16.13.2
