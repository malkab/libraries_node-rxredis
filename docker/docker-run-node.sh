#!/bin/bash

# Runs an interactive session for development

. ./env.env

# In Docker, FRONTENDPORT must match the internal container port
# for Zone.js sockets to work properly

docker run -ti --rm \
    --name $DEV_CONTAINERNAME \
    --network container:$DEV_REDIS_CONTAINERNAME \
    -v $(pwd)/../node/:$(pwd)/../node/ \
    -v ~/.npmrc:/root/.npmrc \
    --workdir $(pwd)/../node/ \
    --entrypoint /bin/bash \
    malkab/nodejs-dev:$NODEVERSION
