const config = require('../config');
const memoryCache = require('../middleware/lru-cache');
const redisCache = require('../middleware/redis-cache');
const logger = require('./logger');

module.exports = (app) => {
    if (config.cacheType === 'memory') {
        app.use(
            memoryCache({
                app: app,
                expire: config.cacheExpire,
                ignoreQuery: true,
            })
        );
    } else if (config.cacheType === 'redis') {
        app.use(
            redisCache({
                app: app,
                expire: config.cacheExpire,
                ignoreQuery: true,
                redis: config.redis,
                onerror: (e) => {
                    logger.error('Redis error: ', e);
                },
                onconnect: () => {
                    logger.info('Redis connected.');
                },
            })
        );
    } else {
        app.context.cache = {
            get: () => null,
            set: () => null,
        };
    }
    app.context.cache.tryGet = async function(key, getValueFunc, maxAge = 24 * 60 * 60) {
        let v = await this.get(key);
        if (!v) {
            v = await getValueFunc();
            this.set(key, v, maxAge);
        } else {
            let parsed;
            try {
                parsed = JSON.parse(v);
            } catch (e) {
                parsed = null;
            }
            if (parsed) {
                v = parsed;
            }
        }

        return v;
    };
};
