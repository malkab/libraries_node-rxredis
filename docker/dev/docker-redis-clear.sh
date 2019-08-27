#!/bin/bash

. ../env.env

# Clears the Redis cache
    
docker run -ti --rm \
    --name rxjs-redis-cache-cleaner \
    --network container:$DEV_REDIS_CONTAINERNAME \
    -v `pwd`:/ext-src/ \
    --workdir /ext-src/ \
    --entrypoint /bin/bash \
    redis:4.0 \
    -c "redis-cli -a redis flushall"
