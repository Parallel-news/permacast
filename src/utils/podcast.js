import { WEBSITE_URL, MESON_ENDPOINT } from "./arweave";
import FastAverageColor from 'fast-average-color'

export async function getColor (url) {
  const fac = new FastAverageColor();
  let color = await fac.getColorAsync(url);
  return color.rgb;
}

export async function convertToEpisode(podcast, episode, useColor=true) {
  const rgb = useColor ? await getColor(MESON_ENDPOINT + '/' + podcast.cover) : 'rgb(0,0,20)';

  return {
    cover: MESON_ENDPOINT + '/' + podcast.cover,
    title: episode.episodeName,
    description: episode.description,
    episodesCount: podcast.episodes.length,
    firstTenEpisodes: () => null,
    getEpisodes: () => null,
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorEmail: podcast.email,
    creatorANS: podcast.ansOwnerLabel,
    createdAt: episode.uploadedAt,
    explicit: podcast.explicit,
    visible: episode.isVisible,
    language: podcast.language,
    contentUrl: MESON_ENDPOINT + '/' + episode.contentTx,
    contentTX: episode.contentTx,
    podcastId: podcast.pid,
    mediaType: episode.type,
    objectType: 'episode',
    superAdmins: podcast.superAdmins,
    rgb: rgb,
  };
}

export async function convertToPodcast(podcast) {
  const rgb = await getColor(MESON_ENDPOINT + '/' + podcast.cover) 

  return {
    cover: MESON_ENDPOINT + '/' + podcast.cover,
    title: podcast.podcastName,
    description: podcast.description,
    episodesCount: podcast.episodes.length,
    firstTenEpisodes: () => podcast.episodes.splice(0, 10).map(e => convertToEpisode(podcast, e, false)),
    getEpisodes: (start, end) => podcast.episodes.splice(start, end).map(e => convertToEpisode(podcast, e, false)),
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorEmail: podcast.email,
    creatorANS: podcast.ansOwnerLabel,
    createdAt: podcast.createdAt,
    explicit: podcast.explicit,
    visible: podcast.isVisible,
    language: podcast.language,
    contentUrl: null,
    contentTX: null,
    podcastId: podcast.pid,
    mediaType: null,
    objectType: 'podcast',
    superAdmins: podcast.superAdmins,
    rgb: rgb,
  }
}

export function filters(t) {
  return [
    {type: "podcastsactivity", desc: t("sorting.podcastsactivity")},
    {type: "episodescount", desc: t("sorting.episodescount")}
  ]
}

export function filterTypes(filters) { 
  return filters.map(f => f.type)
}

export const fetchPodcasts = async () => {
  const json = await (
    await fetch("https://whispering-retreat-94540.herokuapp.com/feeds/podcasts")
  ).json();
  return json.res;
};

export const sortPodcasts = async (filters) => {
  let url = `${WEBSITE_URL}/feeds/podcasts/sort/`;
  let result = [];
  
  // Basically, this sandwiches all possible filter requests into one
  await Promise.all(filters.map(async (filter) => {
    result[filter] = await fetch(url+filter).then(res => res.json()).then(json => json.res);
  }))

  return result;
};
