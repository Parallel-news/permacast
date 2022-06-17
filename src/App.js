import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from "react-router-dom";
import Sidenav from "./component/sidenav.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import FeaturedEpisode from './component/featured_episode.jsx';


import { sortPodcasts, filterTypes, filters } from './utils/podcast.js'

// import Podcast from "./component/podcast.jsx";
// import Index from "./component/index.jsx";
// import PodcastRss from "./component/podcast_rss.jsx";

export default function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true)
  //     // const sorted = await sortPodcasts(filterTypes)
  //     // const podcastsHtml = renderPodcasts(sorted[filterTypes[selection]])
  //     // setPodcastsHtml(podcastsHtml)
  //     // setSortedPodcasts(sorted)
  //     setLoading(false)
  //   }
  //   fetchData()
  // }, [])


  return (
    <div className="h-screen bg-black flex">
      <div>
        <Sidenav />
      </div>
      <div className="flex w-screen text-white">
        <div className="w-3/4">
          <Searchbar />
        </div>
      </div>

    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
