const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')
const axios = require('axios');

const manifest = {
    id: 'org.jsubtitles',
    version: '1.0.0',
    logo: 'https://i.imgur.com/Zkg72RS.jpeg',
    name: 'JSubtitles',
    description: 'substitle for JaMovies Addon',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: [] 
}

const builder = new addonBuilder(manifest)

builder.defineSubtitlesHandler(async ({ type, id, extra }) => {
    if (type === 'movie' && id.startsWith('tt')) {
        try {
            const response = await axios.get(`https://hsvideo.vercel.app/vidsrc/${id}`);
            const data = response.data;

            if (data.status === 200) {
                const subtitles = data.sources[0].data.subtitle.map(sub => ({
                    url: sub.file,
                    lang: `JSub ${sub.lang}`
                }));
                console.log(id)
                console.log(subtitles);
                return Promise.resolve({ subtitles });
            } else {
                return Promise.resolve({ subtitles: [] });
            }
        } catch (error) {
            console.error(error);
            return Promise.resolve({ subtitles: [] });
        }
    } else if (type === 'series' && id.startsWith('tt')) {
        const season = extra.season;
        const episode = extra.episode;

        try {
            const response = await axios.get(`https://vidsrc-api-bice.vercel.app/${id}?s=${season}&e=${episode}`);
            const data = response.data;

            if (data.status === 200) {
                const subtitles = data.sources[0].data.subtitle.map(sub => ({
                    url: sub.file,
                    lang: `JSub ${sub.lang}`
                }));
                return Promise.resolve({ subtitles });
            } else {
                return Promise.resolve({ subtitles: [] });
            }
        } catch (error) {
            console.error(error);
            return Promise.resolve({ subtitles: [] });
        }
    } else {
        return Promise.resolve({ subtitles: [] });
    }
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })
