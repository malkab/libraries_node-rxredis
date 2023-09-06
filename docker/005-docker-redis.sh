#!/bin/bash

docker run -ti --rm \
    --name=rxredis-redis-dev \
    --hostname=rxredis-redis-dev \
    -v $(pwd)/config/redis.conf:/redis.conf:ro \
    -v $(pwd)/redis_data/:/data \
    -p 6379:6379 \
    redis:5.0 \
    redis-server /redis.conf --appendonly yes
