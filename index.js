require('./utils/request');
const config = require('./config');
const Koa = require('koa');
const fs = require('fs');
const logger = require('./utils/logger');

const onerror = require('./middleware/onerror');
const header = require('./middleware/header');
const utf8 = require('./middleware/utf8');
const cache = require('./utils/cache');
const parameter = require('./middleware/parameter');
const template = require('./middleware/template');
const favicon = require('koa-favicon');
const debug = require('./middleware/debug');
const accessControl = require('./middleware/access-control');

const router = require('./router');
// const protected_router = require('./protected_router');
// const mount = require('koa-mount');
const staticFile = require('./staticFile');
const koaStatic = require('koa-static');
const koaRange = require('koa-range');
const path = require('path');

// API related
// const apiTemplate = require('./middleware/api-template');
// const api_router = require('./api_router');
// const apiResponseHandler = require('./middleware/api-response-handler');

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

logger.info('🎉 RSSHub start! Cheers!');

const app = new Koa();
app.proxy = true;

// favicon
app.use(favicon(__dirname + '/favicon.png'));

// global error handing
app.use(onerror);

// 1 set header
app.use(header);

app.use(accessControl);

// 6 debug
app.context.debug = {
    hitCache: 0,
    request: 0,
    routes: [],
    ips: [],
};
app.use(debug);

// 5 fix incorrect `utf-8` characters
app.use(utf8);

// app.use(apiTemplate);
// app.use(apiResponseHandler());

// 4 generate body
app.use(template);
// 3 filter content
app.use(parameter);

// 2 cache
cache(app);

// router
app.use(router.routes()).use(router.allowedMethods());

// routes the require authentication
// app.use(mount('/protected', protected_router.routes())).use(protected_router.allowedMethods());

// API router
// app.use(mount('/api', api_router.routes())).use(api_router.allowedMethods());

// static files
app.use(koaRange);
app.use(staticFile);
require('./clearExpireFile');
app.use(
    koaStatic(path.join(__dirname, 'static'), {
        maxage: 24 * 60 * 60 * 1000,
        hidden: false,
        gzip: false,
    })
);

// connect
if (config.connect.disabled) {
    process.exit();
}
if (config.connect.port) {
    app.listen(config.connect.port, parseInt(config.listenInaddrAny) ? null : '127.0.0.1');
    logger.info('Listening Port ' + config.connect.port);
}
if (config.connect.socket) {
    if (fs.existsSync(config.connect.socket)) {
        fs.unlinkSync(config.connect.socket);
    }
    app.listen(config.connect.socket, parseInt(config.listenInaddrAny) ? null : '127.0.0.1');
    logger.info('Listening Unix Socket ' + config.connect.socket);
    process.on('SIGINT', () => {
        fs.unlinkSync(config.connect.socket);
        process.exit();
    });
}
