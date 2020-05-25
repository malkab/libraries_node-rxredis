#!/bin/bash

# --------------------------------
#
# Runs an standalone Redis
#
# Document here the purpose of the script
#  
# --------------------------------

# REMEMBER: Redis hosts are accessed with the URL redis://host

# Usually this container needs a name for others to connect to it
REDIS_CONTAINER_NAME=rxredis-redis
# The version of Redis to run
REDIS_VERSION=4.0





# ---

docker run -ti --rm \
    --name $REDIS_CONTAINER_NAME \
    -v $(pwd)/redis-data/:/data \
    -v $(pwd):/ext-src/ \
    -v $(pwd)/config/redis.conf:/redis.conf:ro \
    --workdir /ext-src/ \
    --entrypoint /bin/bash \
    redis:$REDIS_VERSION \
    -c "redis-server /redis.conf --appendonly yes"
