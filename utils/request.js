const request = require('request');
const rp = require('request-promise');
const config = require('../config');

require.cache[require.resolve('request')].exports = request.defaults({
    headers: {
        'User-Agent': config.ua,
    },
    proxy: 'http://localhost:1087',
});

require.cache[require.resolve('request-promise')].exports = rp.defaults({
    headers: {
        'User-Agent': config.ua,
    },
    proxy: 'http://localhost:1087',
});
