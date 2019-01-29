const request = require('request');
const config = require('../config');
const logger = require('./logger');

if (config.proxy.protocol && config.proxy.host && config.proxy.port) {
    logger.info(`Hack request.js proxy: ${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`);
    require.cache[require.resolve('request')].exports = request.defaults({
        proxy: `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`,
    });
}
