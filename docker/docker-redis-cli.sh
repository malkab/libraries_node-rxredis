#!/bin/bash

. ./env.env

# Runs a development Redis cli session

docker run -ti --rm \
    --name rxjs-redis-dev-redis-cli \
    --network container:$DEV_REDIS_CONTAINERNAME \
    -v `pwd`:/ext-src/ \
    --workdir /ext-src/ \
    --entrypoint /bin/bash \
    redis:4.0 \
    -c "redis-cli -a redis"
