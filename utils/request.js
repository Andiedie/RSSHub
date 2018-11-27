const request = require('request');
const util = require('util');
const config = require('../config');

request.get = util.promisify(request.get);
request.post = util.promisify(request.post);
request.defaults({
    headers: {
        'User-Agent': config.ua,
    },
});

module.exports = request;
