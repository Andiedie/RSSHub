const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const seasonid = ctx.params.seasonid;
    const response = await axios({
        method: 'get',
        url: `https://www.bilibili.com/bangumi/play/ss${seasonid}`,
    });

    const data = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]) || {};

    ctx.state.data = {
        title: data.mediaInfo.title,
        link: `https://www.bilibili.com/bangumi/media/md${data.mediaInfo.id}/`,
        description: data.mediaInfo.evaluate,
        item:
            data.epList &&
            data.epList.reverse().map((item) => ({
                title: `${item.titleFormat} ${item.longTitle}`,
                description: `<img referrerpolicy="no-referrer" src="${item.cover}">`,
                link: `https://www.bilibili.com/bangumi/play/ep${item.id}`,
            })),
    };
};
