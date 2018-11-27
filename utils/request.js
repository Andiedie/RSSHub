const request = require('request');
const util = require('util');
const config = require('../config');

request.getAsync = util.promisify(request.get);
request.postAsync = util.promisify(request.post);
request.defaults({
    headers: {
        'User-Agent': config.ua,
    },
});

module.exports = request;
