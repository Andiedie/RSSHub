const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const STATIC_PATH = path.resolve(__dirname, 'static');
// A week
const EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000;
// A day
const INTERVAL = 24 * 60 * 60 * 1000;

logger.info('Clear task started!');
setInterval(() => {
    const filenames = fs.readdirSync(STATIC_PATH);
    for (const filename of filenames) {
        if (filename === '.gitkeep') {
            continue;
        }
        const filepath = path.resolve(STATIC_PATH, filename);
        const stat = fs.statSync(filepath);
        if (new Date().getTime() - stat.atime.getTime() > EXPIRE_TIME) {
            logger.info(`${filename} expired, removed.`);
            fs.unlinkSync(filepath);
        }
    }
}, INTERVAL);
