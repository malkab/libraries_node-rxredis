#!/bin/bash

# --------------------------------
#
# Runs an interactive Node session for development
#
# Main Node dev container
#  
# --------------------------------

# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost". Keep in mind that linking to a container and using the -p
# option for debugging results in a conflict. Use an external network if
# both features are needed
NETWORK=container:rxredis-redis
# Container name
CONTAINER_NAME=rxredis-node-dev
# Node version image
NODE_VERSION=v10.16.0
# Debug port
DEV_DEBUG_PORT=9008
# Container host name
CONTAINER_HOST_NAME=


# ---

# Command string

if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}"; fi

if [ ! -z "${CONTAINER_NAME}" ]; then CONTAINER_NAME="--name=${CONTAINER_NAME}"; fi

if [ ! -z "${CONTAINER_HOST_NAME}" ]; then CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}"; fi

eval    docker run -ti --rm \
        -e "VERSION=development" \
        -v $(pwd)/../node/:$(pwd)/../node/ \
        -v ~/.npmrc:/root/.npmrc:ro \
        --workdir $(pwd)/../node/ \
        --entrypoint /bin/bash \
        $COMMAND \
        $NETWORK \
        $CONTAINER_NAME \
        $CONTAINER_HOST_NAME \
        malkab/nodejs-dev:$NODE_VERSION
