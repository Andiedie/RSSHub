const request = require('request');
const util = require('util');
const config = require('../config');

const instance = request.defaults({
    headers: {
        'User-Agent': config.ua,
    },
    proxy: 'http://localhost:1087',
});
instance.getAsync = util.promisify(request.get);
instance.postAsync = util.promisify(request.post);

require.cache[require.resolve('request')].exports = instance;
