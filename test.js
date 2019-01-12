require('./utils/request');
const request = require('request-promise');

(async () => {
  const data = await request.get(`https://twitter.com/`);
  console.log(data);
})();