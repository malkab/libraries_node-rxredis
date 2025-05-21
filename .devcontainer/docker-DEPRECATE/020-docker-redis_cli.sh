#!/bin/bash

docker run -ti --rm \
    --network=container:rxredis-redis-dev \
    --name=rxredis-redis-cli \
    -v $(pwd):/ext_src \
    --entrypoint /bin/bash \
    redis:5.0 \
    -c "redis-cli -a redis -h localhost -p 6379"
