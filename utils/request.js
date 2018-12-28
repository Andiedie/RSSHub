let request = require('request');
const util = require('util');
const config = require('../config');

request = request.defaults({
    headers: {
        'User-Agent': config.ua,
    },
    proxy: 'http://localhost:1087',
});
request.getAsync = util.promisify(request.get);
request.postAsync = util.promisify(request.post);

module.exports = request;
