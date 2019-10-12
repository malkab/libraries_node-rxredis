#!/bin/bash

# --------------------------------
#
# Runs a cli session on a Redis
#
# Document here the purpose of the script
#  
# --------------------------------

# Redis host - REMEMBER: here do not use the redis:// protocol, use
# directly the host name
HOST=localhost
# Redis port
PORT=6379
# Redis password
PASS=redis
# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost". Keep in mind that linking to a container and using the -p
# option for debugging results in a conflict. Use an external network if
# both features are needed
NETWORK=container:rxredis-redis
# The version of Redis to run
REDIS_VERSION=4.0





# ---

if [ -z "${NETWORK}" ]; then

    docker run -ti --rm \
        -v `pwd`:/ext-src/ \
        --workdir /ext-src/ \
        --entrypoint /bin/bash \
        redis:$REDIS_VERSION \
        -c "redis-cli -a ${PASS} -h ${HOST} -p ${PORT}"

else

    docker run -ti --rm \
        --network $NETWORK \
        -v `pwd`:/ext-src/ \
        --workdir /ext-src/ \
        --entrypoint /bin/bash \
        redis:$REDIS_VERSION \
        -c "redis-cli -a ${PASS} -h ${HOST} -p ${PORT}"

fi
