Please take care of opening as few connections as possible. The main
RxRedis file needs a connection, RxRedisQueue and ChannelListener are
blocking procedures so each needs a connection too. RxRedisHashDs, if
not standalone, should reuse an existing RxRedis connection and be
created from an existing RxRedis object or passing an existing one in
the constructor.

RxPg / RxRedis deben minimozar conexiones en sus clases derivadas,
reusarlas entre objetos, creando conexiones RxPg RxRedis. Estas últimas
del tipo no-bloqueantes.

Enable a flag at rxredis for not allowing blopcking operations
(readonky), whn reusing in classes, check at constructor for not or
allow blocking oprations to play it safe.

RxRedis only should map basic Redis commands, and be the client used in
RQueue and Pub / Sub, so RxRedis remains single client in the end.

RxRedisQueue and RxRedisChannelListener returns SUBJECTS.

RxRedisHashDs will be a wrapper for storing shared data at Redis hashes.

Data store at Redis will use the following tags:

    ___rxredishash___::[[data store name]]::[[hash name]]

Each instance of RxRedisHashDS manages a single collection or data
store.
