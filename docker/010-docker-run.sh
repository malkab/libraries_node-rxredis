#!/bin/bash

    # --network=container:rxredis-redis-dev \

docker run -ti --rm \
    -e NODE_ENV=development \
    -e NODE_MEMORY=2GB \
    --name=rxredis-node-dev \
    -v $(pwd):/ext_src \
    -v $(pwd)/../node/:$(pwd)/../node/ \
    -v ~/.npmrc:/home/node/.npmrc:ro \
    --entrypoint /bin/bash \
    --workdir $(pwd)/../node/ \
    malkab/nodejs-dev:16.13.2
