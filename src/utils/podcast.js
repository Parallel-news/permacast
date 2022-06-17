import { WEBSITE_URL } from "./arweave";
// import React, {useTranslation} from "react";
// const { t } = useTranslation()

export const fetchPodcasts = async () => {
  /* DEV: DEPRECATED FEATURE */
  const json = await (
    await fetch(`${WEBSITE_URL}/feeds/podcasts`)
  ).json();
  return json.res;
};

export const filters = [
  // {type: "podcastsactivity", desc: t("sorting.podcastsactivity")},
  // {type: "episodescount", desc: t("sorting.episodescount")}
]
export const filterTypes = filters.map(f => f.type)

export const sortPodcasts = async (filters) => {
  let url = `${WEBSITE_URL}/feeds/podcasts/sort/`;
  let result = [];
  
  // Basically, this sandwiches all possible filter requests into one
  await Promise.all(filters.map(async (filter) => {
    result[filter] = await fetch(url+filter).then(res => res.json()).then(json => json.res);
  }))

  return result;
};
