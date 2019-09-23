#!/bin/bash

# Execs into the dev container

. ./env.env

docker exec -ti \
    $DEV_REDIS_CONTAINERNAME \
    /bin/bash
