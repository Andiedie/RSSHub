const logger = require('./logger');
const config = require('../config');
const SocksProxyAgent = require('socks-proxy-agent');
const tunnel = require('tunnel');
const axiosRetry = require('axios-retry');
const axios = require('axios');

axios.proxy = axios;
if (config.proxy && config.proxy.protocol && config.proxy.host && config.proxy.port) {
    const agents = {
        httpAgent: null,
        httpsAgent: null,
    };
    if (config.proxy.protocol.slice(0, 5) === 'socks') {
        const proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;
        agents.httpAgent = new SocksProxyAgent(proxyUrl);
        agents.httpsAgent = new SocksProxyAgent(proxyUrl);
    } else if (config.proxy.protocol === 'http') {
        const tunnelOption = {
            proxy: {
                host: config.proxy.host,
                port: config.proxy.port,
            },
        };
        agents.httpAgent = tunnel.httpOverHttp(tunnelOption);
        agents.httpsAgent = tunnel.httpsOverHttp(tunnelOption);
    } else if (config.proxy.protocol === 'https') {
        const tunnelOption = {
            proxy: {
                host: config.proxy.host,
                port: config.proxy.port,
            },
        };
        agents.httpAgent = tunnel.httpOverHttps(tunnelOption);
        agents.httpsAgent = tunnel.httpsOverHttps(tunnelOption);
    }
    // axios closure lead to recursive invokation on create
    const axiosCpy = axios;
    // When used directly
    const axiosProxy = axios.create({
        ...agents,
    });
    axiosProxy.create = function(option, ...args) {
        option = option || {};
        option = {
            ...agents,
            ...option,
        };
        return axiosCpy.create(option, ...args);
    };
    axios.proxy = axiosProxy;
    logger.info(`Using proxy ${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`);
}
axiosRetry(axios, {
    retries: config.requestRetry,
    retryCondition: () => true,
    retryDelay: (count, err) => {
        logger.error(`Request ${err.config.url} fail, retry attempt #${count}: ${err}`);
        return 100;
    },
});

axios.defaults.headers.common['User-Agent'] = config.ua;
axios.defaults.headers.common['X-APP'] = 'RSSHub';

module.exports = axios;
