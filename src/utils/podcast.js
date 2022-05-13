const fetchPodcasts = async () => {
  const json = await (
    await fetch("https://whispering-retreat-94540.herokuapp.com/feeds/podcasts")
  ).json();
  return json.res;
};

export default fetchPodcasts;
