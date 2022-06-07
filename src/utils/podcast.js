export const fetchPodcasts = async () => {
  const json = await (
    await fetch("https://whispering-retreat-94540.herokuapp.com/feeds/podcasts")
  ).json();
  return json.res;
};

export const sortPodcasts = async (filters) => {
  let url = "https://whispering-retreat-94540.herokuapp.com/feeds/podcasts/sort/";
  let result = [];
  
  // Basically, this sandwiches all possible filter requests into one
  await Promise.all(filters.map(async (filter) => {
    if (filter === "default") return false;
    result[filter] = await fetch(url+filter).then(res => res.json()).then(json => json.res);
  }))

  return result;
};
