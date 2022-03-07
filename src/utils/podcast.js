const fetchPodcasts = async () => {
  const json = await (
    await fetch("https://permacast-cache.herokuapp.com/feeds/podcasts")
  ).json();
  return json.res;
};

export default fetchPodcasts;
