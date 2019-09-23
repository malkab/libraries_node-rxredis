# Start Up

First, fire the **docker-run-redis.sh**. This will start a Redis
instance, all other containers connect to this container as network.

**redis-data** folder contains the Redis folder, for example for log
checking.

**docker-run-node.sh** will launch a Docker container with a
configured dev environment. Check npm targets at source's
**package.json**, being the most usual one **npm start** to launch a
watching Webpack dev server.
