const {
  addonBuilder,
  serveHTTP,
  publishToCentral,
} = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
  id: "org.jsubtitles",
  version: "1.0.0",
  logo: "https://i.imgur.com/Zkg72RS.jpeg",
  name: "JSubtitles",
  description: "Subtitle for JaMovies Addon",
  resources: ["subtitles"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [],
};

const builder = new addonBuilder(manifest);

function getLangCode(lang) {
  const langMap = {
    Abkhazian: "abk",
    Arabic: "ara",
    Bengali: "ben",
    "Brazillian Portuguese": "por",
    Bulgarian: "bul",
    "Chinese (BG code)": "zho",
    "Chinese (Bilingual)": "zho",
    Croatian: "hrv",
    Czech: "ces",
    Danish: "dan",
    Dutch: "nld",
    English: "eng",
    Estonian: "est",
    Finnish: "fin",
    French: "fra",
    German: "deu",
    Greek: "ell",
    Hebrew: "heb",
    Hungarian: "hun",
    Indonesian: "ind",
    Italian: "ita",
    Japanese: "jpn",
    Korean: "kor",
    Malay: "msa",
    Norwegian: "nor",
    Persian: "fas",
    Polish: "pol",
    Portuguese: "por",
    Romanian: "ron",
    Russian: "rus",
    Serbian: "srp",
    Sinhalese: "sin",
    Slovenian: "slv",
    "Spanish (LA)": "spa",
    Spanish: "spa",
    Swedish: "swe",
    Thai: "tha",
    Turkish: "tur",
    Urdu: "urd",
    Vietnamese: "vie",
    // tambahkan lebih banyak bahasa jika diperlukan
  };
  return langMap[lang] || lang;
}

builder.defineSubtitlesHandler(async ({ type, id, extra }) => {
  if (type === "movie" && id.startsWith("tt")) {
    try {
      const response = await axios.get(
        `https://hsvideo.vercel.app/vidsrc/${id}`
      );
      const data = response.data;

      if (data.status === 200) {
        const sources = data.sources;
        let subtitles = [];
        for (const source of sources) {
          if (source.name === "Filemoon" && source.data.subtitle) {
            subtitles = source.data.subtitle.map((sub) => ({
              id: sub.lang,
              url: sub.file,
              lang: getLangCode(sub.lang),
            }));
            break;
          }
        }
        if (subtitles.length === 0) {
          for (const source of sources) {
            if (source.name === "Vidplay" && source.data.subtitle) {
              subtitles = source.data.subtitle.map((sub) => ({
                id: sub.lang,
                url: sub.file,
                lang: getLangCode(sub.lang),
              }));
              break;
            }
          }
        }

        console.log(id);
        console.log(subtitles);
        return Promise.resolve({ subtitles });
      } else {
        return Promise.resolve({ subtitles: [] });
      }
    } catch (error) {
      console.error(error);
      return Promise.resolve({ subtitles: [] });
    }
  } else if (type === "series" && id.startsWith("tt")) {
    const season = extra.season;
    const episode = extra.episode;

    try {
      const response = await axios.get(
        `https://vidsrc-api-bice.vercel.app/${id}?s=${season}&e=${episode}`
      );
      const data = response.data;

      if (data.status === 200) {
        const sources = data.sources;
        let subtitles = [];

        // Cek setiap sumber
        for (const source of sources) {
          if (source.name === "Filemoon" && source.data.subtitle) {
            subtitles = source.data.subtitle.map((sub) => ({
              id: sub.lang,
              url: sub.file,
              lang: getLangCode(sub.lang),
            }));
            break;
          }
        }

        if (subtitles.length === 0) {
          for (const source of sources) {
            if (source.name === "Vidplay" && source.data.subtitle) {
              subtitles = source.data.subtitle.map((sub) => ({
                id: sub.lang,
                url: sub.file,
                lang: getLangCode(sub.lang),
              }));
              break;
            }
          }
        }

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

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
