const request = require('./utils/request');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

module.exports = async (ctx, next) => {
    const resourceUrl = decodeURIComponent(ctx.path.substr(1));
    const ext = path.parse(url.parse(resourceUrl).pathname).ext;
    const filename = md5(resourceUrl) + ext;
    ctx.path = `/${filename}`;
    await next();
    if (ctx.status !== 404) {
        return;
    }
    const response = request.get(resourceUrl);
    response.pipe(
        fs.createWriteStream(path.resolve(__dirname, 'static', filename), {
            flags: 'w+',
        })
    );
    ctx.body = response;
    ctx.status = 200;
};

function md5(str) {
    return crypto
        .createHash('md5')
        .update(str)
        .digest('hex');
}
