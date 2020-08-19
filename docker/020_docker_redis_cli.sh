#!/bin/bash

# Version: 2020-08-19

# -----------------------------------------------------------------
#
# Starts a CLI session on the dev Redis.
#
# -----------------------------------------------------------------
#
# Runs a cli session on a Redis.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=common
# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost". Keep in mind that linking to a container and using the -p
# option for debugging results in a conflict. Use an external network if
# both features are needed.
NETWORK=container:rxredis-redis-dev
# Redis host - REMEMBER: here do not use the redis:// protocol, use
# directly the host name. And if container: was used as network,
# remember that the host will be localhost.
HOST=localhost
# Redis port.
PORT=6379
# Redis password.
PASS=redis
# Container name.
CONTAINER_NAME=rxredis-redis-cli
# Container host name. Incompatible with NETWORK=container:XXX.
CONTAINER_HOST_NAME=
# Source folder to mount on /ext_src/.
# A local folder with $(pwd) or a system-wide volume.
SRC_FOLDER=$(pwd)
# The version of Redis to run.
REDIS_VERSION=$MLKC_REDIS_VERSION





# ---

# Check mlkcontext

if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi


# Command string

if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi

if [ ! -z "${CONTAINER_NAME}" ]; then CONTAINER_NAME="--name=${CONTAINER_NAME}" ; fi

if [ ! -z "${CONTAINER_HOST_NAME}" ]; then CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}" ; fi

if [ ! -z "${SRC_FOLDER}" ]; then SRC_FOLDER="-v ${SRC_FOLDER}:/ext_src/" ; fi

eval    docker run -ti --rm \
        $NETWORK \
        $CONTAINER_NAME \
        $CONTAINER_HOST_NAME \
        $SRC_FOLDER \
        --workdir /ext_src/ \
        --entrypoint /bin/bash \
        redis:$REDIS_VERSION \
        -c \"redis-cli -a ${PASS} -h ${HOST} -p ${PORT}\"
