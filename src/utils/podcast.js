import { WEBSITE_URL, MESON_ENDPOINT } from "./arweave";
import FastAverageColor from 'fast-average-color'

export async function getColor (url) {
  const fac = new FastAverageColor();
  let color = await fac.getColorAsync(url);
  return color.rgb;
}

export async function convertToEpisode(podcast, episode) {
  const rgb = await getColor(MESON_ENDPOINT + '/' + podcast.cover) 

  return {
    cover: MESON_ENDPOINT + '/' + podcast.cover,
    title: episode.episodeName,
    description: episode.description,
    episodesCount: podcast.episodes.length,
    firstTenEpisodes: () => null,
    getEpisodes: (start, count) => podcast.episodes.splice(start, count),
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorANS: podcast.ansOwnerLabel,
    contentUrl: MESON_ENDPOINT + '/' + episode.contentTx,
    mediaType: episode.type,
    objectType: 'episode',
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
    firstTenEpisodes: () => podcast.episodes.splice(0, 10).map(e => convertToEpisode(podcast, e)),
    getEpisodes: (start, count) => podcast.episodes.splice(start, count),
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorANS: podcast.ansOwnerLabel,
    contentUrl: null,
    mediaType: null,
    objectType: 'podcast',
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

export const sortPodcasts = async (filters) => {
  let url = `${WEBSITE_URL}/feeds/podcasts/sort/`;
  let result = [];
  
  // Basically, this sandwiches all possible filter requests into one
  await Promise.all(filters.map(async (filter) => {
    result[filter] = await fetch(url+filter).then(res => res.json()).then(json => json.res);
  }))

  return result;
};
