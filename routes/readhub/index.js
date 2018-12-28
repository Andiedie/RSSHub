const axios = require('../../utils/axios');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const { data } = await axios.get('https://api.readhub.cn/topic');

    const items = [];
    for (const one of data.data) {
        const id = one.id;
        const cache = ctx.cache.get(id);
        if (cache) {
            items.push(cache);
            continue;
        }
        const link = `https://readhub.cn/topic/${id}`;
        const res = await axios.get(link);
        const {
            topicDetail: { data },
        } = JSON.parse(/window\.__INITIAL_STATE__ = (.*?);/.exec(res.data)[1]);
        let description = data.summary;
        if (data.newsArray) {
            description += '<br/><br/>媒体报道：';
            for (const one of data.newsArray) {
                description += `<br/>${one.siteName}: <a href='https://readhub.cn/topic/${one.id}'>${one.title}</a> ${dayjs(new Date(one.publishDate)).format('YYYY-MM-DD HH:mm')}`;
            }
        }
        if (data.timeline && data.timeline.topics) {
            description += '<br/><br/>相关事件：';
            for (const one of data.timeline.topics) {
                description += `<br/><a href='https://readhub.cn/topic/${one.id}'>${one.title}</a> ${dayjs(new Date(one.createdAt)).format('YYYY-MM-DD HH:mm')}`;
            }
        }
        const item = {
            title: data.title,
            description,
            pubDate: data.publishDate,
            guid: id,
            link,
        };
        items.push(item);
        ctx.cache.set(id, item);
    }
    ctx.state.data = {
        title: `Readhub 热门话题`,
        link: 'https://readhub.cn',
        item: items,
    };
};
