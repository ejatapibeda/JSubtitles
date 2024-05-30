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
    Abkhazian: "ab",
    Arabic: "ar",
    Bengali: "bn",
    "Brazillian Portuguese": "pt-BR",
    Bulgarian: "bg",
    "Chinese (BG code)": "zh",
    "Chinese (Bilingual)": "zh",
    Croatian: "hr",
    Czech: "cs",
    Danish: "da",
    Dutch: "nl",
    English: "en",
    Estonian: "et",
    "Farsi/Persian": "fa",
    Finnish: "fi",
    French: "fr",
    German: "de",
    Greek: "el",
    Hebrew: "he",
    Hungarian: "hu",
    Indonesian: "id",
    Italian: "it",
    Japanese: "ja",
    Korean: "ko",
    Malay: "ms",
    Norwegian: "no",
    Persian: "fa",
    Polish: "pl",
    Portuguese: "pt",
    Romanian: "ro",
    Russian: "ru",
    Serbian: "sr",
    Sinhalese: "si",
    Slovenian: "sl",
    "Spanish (LA)": "es",
    Spanish: "es",
    Swedish: "sv",
    Thai: "th",
    Turkish: "tr",
    Urdu: "ur",
    Vietnamese: "vi",
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
