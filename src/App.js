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

  let podcas = [
    {
      podcastName: 'The Gentlemen',
      cover: 'https://upload.wikimedia.org/wikipedia/en/0/06/The_Gentlemen_poster.jpg',
      episodes: 18,
      description: 'Funny British Accent',
      owner: 'GuyRitchie'
    }, {
      podcastName: 'Donnie Darko',
      cover: 'https://upload.wikimedia.org/wikipedia/en/d/db/Donnie_Darko_poster.jpg',
      episodes: 18,
      description: 'Time travelling is cool',
      owner: 'RichardKelly'
    }, {
      podcastName: 'The Prestige',
      cover: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg',
      episodes: 18,
      description: 'Amazing twist, gripping story',
      owner: 'ChristopherNolan'
    }
  ]  

  return (
    <div className="h-full bg-black overflow-hidden">
      <div className="flex h-screen">
        <div>
          <Sidenav />
          <div className="absolute z-10 bottom-0">
            <Player />
          </div>
        </div>
        <div className="grid grid-cols-12 overflow-scroll ml-16 mr-10 pt-9 pb-20 w-screen">
          <div className="col-span-9">
            <Searchbar />
            <div className="mt-10">
              <h1 className="text-zinc-100 text-xl">Hello, Marton!</h1>
              <p className="text-zinc-400 mb-9">Let's see what we got for today.</p>
              <FeaturedEpisode episode={undefined} podcast={undefined} />
              <FeaturedPodcasts podcasts={podcas} />
              <div className="mt-9 grid grid-cols-3 gap-x-24">
                <div className="col-span-2">
                  <RecentlyAdded themeColor={primaryColor} podcasts={podcas} />
                </div>
                <div className="">
                  <FeaturedCreators themeColor={primaryColor} creators={undefined} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3 ml-12">
            <ArConnect />
            <EpisodeQueue episodes={podcas} themeColor={primaryColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
