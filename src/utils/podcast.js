import { WEBSITE_URL, MESON_ENDPOINT } from "./arweave";

// export function content(cover, title, description, episodes, creator, creatorAddress, creatorANS) {
//   return {
//     cover: cover,
//     title: title,
//     description: description,
//     episodes: episodes,
//     creator: creator,
//     creatorAddress: creatorAddress,
//     creatorANS: creatorANS,
//   }
// }

export function convertToEpisode(podcast, episode) {
  return {
    cover: MESON_ENDPOINT + '/' + podcast.cover,
    title: episode.episodeName,
    description: episode.description,
    episodes: podcast.episodes.length,
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorANS: podcast.ansOwnerLabel,
  };
}

export function convertToPodcast(podcast) {
  return {
    cover: MESON_ENDPOINT + '/' + podcast.cover,
    title: podcast.podcastName,
    description: podcast.description,
    episodes: podcast.episodes.length,
    creator: podcast.author,
    creatorAddress: podcast.owner,
    creatorANS: podcast.ansOwnerLabel,
  }
}

// export function getFirstPodcastEpisode(podcast) {
//   return convertToEpisode(podcast, podcast.episodes[0])
// }


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
