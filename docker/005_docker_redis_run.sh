#!/bin/bash

# Version: 2020-08-19

# -----------------------------------------------------------------
#
# Document here the purpose of the script.
#
# -----------------------------------------------------------------
#
# Runs a Redis instance.
#
# -----------------------------------------------------------------

# REMEMBER: Redis hosts are accessed with the URL redis://host

# Check mlkcontext to check. If void, no check will be performed.
MATCH_MLKCONTEXT=common
# The version of Redis to run.
REDIS_VERSION=$MLKC_REDIS_VERSION
# The network to connect to. Remember that when attaching to the network of an
# existing container (using container:name) the HOST is "localhost".
NETWORK=
# Container name.
CONTAINER_NAME=rxredis-redis-dev
# Container host name. Incompatible with NETWORK=container:XXX.
CONTAINER_HOST_NAME=rxredis-redis-dev
# Route the redis.conf and the Redis data folder here, if applicable.
VOLUMES=(
  $(pwd)/config/redis.conf:/redis.conf:ro
  $(pwd)/redis_data/:/data
)
# Volatile (-ti --rm).
VOLATILE=true
# Open ports in the form (external:internal external:internal). Incompatible
# with NETWORK=container:XXX.
PORTS=(
  6379:6379
)





# ---

echo Running a Redis instance...

# Check mlkcontext
if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then
  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then
    echo Please initialise context $MATCH_MLKCONTEXT
    exit 1
  fi
fi

if [ ! -z "${COMMAND_EXEC}" ] ; then
  COMMAND_EXEC="-c \"${COMMAND_EXEC}\""
fi

if [ ! -z "${NETWORK}" ] ; then
  NETWORK="--network=${NETWORK}"
fi

if [ ! -z "${CONTAINER_NAME}" ] ; then
  CONTAINER_NAME="--name=${CONTAINER_NAME}"
fi

if [ ! -z "${CONTAINER_HOST_NAME}" ] ; then
  CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}"
fi

IMAGE_NAME="redis:${REDIS_VERSION}"

if [ ! -z "${ENTRYPOINT}" ] ; then
  ENTRYPOINT="--entrypoint ${ENTRYPOINT}"
fi

if [ ! -z "${WORKDIR}" ] ; then
  WORKDIR="--workdir ${WORKDIR}"
fi

VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then
  for E in "${VOLUMES[@]}" ; do
    VOLUMES_F="${VOLUMES_F} -v ${E} "
  done
fi

PORTS_F=

if [ ! -z "${PORTS}" ] ; then
  for E in "${PORTS[@]}" ; do
    PORTS_F="${PORTS_F} -p ${E} "
  done
fi

if [ "$VOLATILE" = true ] ; then
  COMMAND="docker run -ti --rm"
else
  COMMAND="docker run -ti"
fi

# Command to execute, can be blank
COMMAND_EXEC="redis-server /redis.conf --appendonly yes"

eval  $COMMAND \
        $NETWORK \
        $CONTAINER_NAME \
        $CONTAINER_HOST_NAME \
        $VOLUMES_F \
        $PORTS_F \
        $IMAGE_NAME \
        $COMMAND_EXEC
