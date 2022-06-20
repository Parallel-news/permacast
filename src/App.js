import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route } from "react-router-dom";
import Sidenav from "./component/sidenav.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import Player from './component/player.jsx';
import { FeaturedEpisode, FeaturedPodcasts, RecentlyAdded, FeaturedCreators } from './component/featured.jsx';
import { sortPodcasts, filterTypes, filters } from './utils/podcast.js'

// import Podcast from "./component/podcast.jsx";
// import Index from "./component/index.jsx";
// import PodcastRss from "./component/podcast_rss.jsx";

export default function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('rgb(255, 255, 0)');
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
    <div className="h-full bg-black overflow-hidden">
      <div className="flex h-screen ">
        <div>
          <Sidenav />
          <div className="absolute z-10 bottom-0">
            <Player />
          </div>
        </div>
        <div className="flex overflow-scroll ml-16 mr-10 pt-9 pb-40">
          <div className="w-[80%]">
            <Searchbar />
            <div className="mt-10">
              <h1 className="text-zinc-100 text-xl">Hello, Marton!</h1>
              <p className="text-zinc-400 mb-9">Let's see what we got for today.</p>
              <FeaturedEpisode episode={undefined} podcast={undefined} />
              <FeaturedPodcasts podcasts={undefined} />
              <div className="mt-9 grid grid-cols-3 gap-x-24">
                <div className="col-span-2">
                  <RecentlyAdded themeColor={primaryColor} podcasts={undefined} />
                </div>
                <div className="">
                  <FeaturedCreators themeColor={primaryColor} creators={undefined} />
                </div>
              </div>
            </div>
          </div>
          <div className="w-[20%] ml-12">
            <ArConnect />
            <EpisodeQueue />
          </div>
        </div>
      </div>
    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
