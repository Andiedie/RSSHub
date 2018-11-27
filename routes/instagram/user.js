const request = require('../../utils/request');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await request.get(`https://www.instagram.com/${id}/`);

    const data = JSON.parse(response.body.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
    const list = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
    const name = data.entry_data.ProfilePage[0].graphql.user.full_name;

    const resources = await Promise.all(
        list.map(async (item) => {
            item = item.node;

            const url = `https://www.instagram.com/p/${item.shortcode}`;
            let resource = await ctx.cache.get(url);
            if (resource) {
                return Promise.resolve(JSON.parse(resource));
            }
            if (item.__typename === 'GraphImage') {
                resource = [
                    {
                        image: item.display_url,
                    },
                ];
            } else if (item.__typename === 'GraphSidecar') {
                const response = await request.get(url);
                const data = JSON.parse(response.body.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                resource = data.entry_data.PostPage[0].graphql.shortcode_media.edge_sidecar_to_children.edges.map((item) => ({
                    image: item.node.display_url,
                    video: item.node.video_url,
                }));
            } else if (item.__typename === 'GraphVideo') {
                const response = await request.get(url);
                const data = JSON.parse(response.body.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                resource = [
                    {
                        image: data.entry_data.PostPage[0].graphql.shortcode_media.display_url,
                        video: data.entry_data.PostPage[0].graphql.shortcode_media.video_url,
                    },
                ];
            }
            ctx.cache.set(url, JSON.stringify(resource), 24 * 60 * 60);
            return Promise.resolve(resource);
        })
    );

    ctx.state.data = {
        title: `${name}(@${id})'s Instagram`,
        link: `https://www.instagram.com/${id}/`,
        item: list.map((item, index) => {
            item = item.node;
            let content = '';
            for (const one of resources[index]) {
                if (one.image) {
                    content += `<img referrerpolicy="no-referrer" src="${one.image}" /><br />`;
                }
                if (one.video) {
                    content += `<video width="100%" controls> <source src="${one.video}" type="video/mp4" /> Your RSS reader does not support video playback. </video>`;
                }
            }

            const title = (item.edge_media_to_caption.edges && item.edge_media_to_caption.edges[0] && item.edge_media_to_caption.edges[0].node.text) || '无题/Untitled';

            return {
                title: `${title}`,
                description: `${title}<br />${content}`,
                pubDate: new Date(item.taken_at_timestamp * 1000).toUTCString(),
                link: `https://www.instagram.com/p/${item.shortcode}/`,
            };
        }),
    };
};
