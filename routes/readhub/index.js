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
        const { data } = await axios.get(`https://api.readhub.cn/topic/${id}`);
        let description = data.summary;
        if (data.newsArray) {
            description += '<br/><br/>媒体报道：';
            for (const one of data.newsArray) {
                description += `<br/>${dayjs(new Date(one.publishDate)).format('YY-MM-DD')} ${one.siteName}: <a href='${one.mobileUrl || one.url}'>${one.title}</a>`;
            }
        }
        if (data.timeline && data.timeline.topics) {
            let type = '相关事件';
            if (data.timeline.commonEntities && data.timeline.commonEntities.length > 0) {
                type = '事件追踪';
            }
            description += `<br/><br/>${type}：`;
            for (const one of data.timeline.topics) {
                description += `<br/>${dayjs(new Date(one.createdAt)).format('YY-MM-DD')} <a href='https://readhub.cn/topic/${one.id}'>${one.title}</a>`;
            }
        }
        const item = {
            title: data.title,
            description: description.replace(new RegExp('\n', 'g'), '<br/>'),
            pubDate: data.publishDate,
            guid: id,
            link: `https://readhub.cn/topic/${id}`,
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
