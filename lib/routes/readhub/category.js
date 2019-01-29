const axios = require('../../utils/axios');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    let title;
    let path = category;
    switch (category) {
        case 'topic':
            title = '热门话题';
            break;
        case 'news':
            title = '科技动态';
            break;
        case 'technews':
            title = '开发者资讯';
            break;
        case 'blockchain':
            title = '区块链快讯';
            break;
        case 'daily':
            title = '每日早报';
            break;
        default:
            break;
    }

    if (path === 'daily') {
        path = 'topic/daily';
    }

    const { data: { data } } = await axios({
        method: 'get',
        url: `https://api.readhub.cn/${path}`,
    });

    const items = [];
    const promises = data.map((one) => axios.get(`https://api.readhub.cn/topic/${one.id}`));
    const results = await Promise.all(promises);
    for (const { data } of results) {
        const id = data.id;
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
    }

    ctx.state.data = {
        title: `Readhub-${title}`,
        link: 'https://readhub.cn',
        item: items,
    };
};
