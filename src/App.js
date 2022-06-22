import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { isDarkMode } from './utils/theme.js';
import { HashRouter as Router, Route } from "react-router-dom";
import Sidenav from "./component/sidenav.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import Player from './component/player.jsx';
import { FeaturedEpisode, FeaturedPodcast, RecentlyAdded, FeaturedCreators } from './component/featured.jsx';
import { sortPodcasts } from './utils/podcast.js'


export default function App() {
  const { t } = useTranslation()

  const [podcasts, setPodcasts] = useState();
  const [sortedPodcasts, setSortedPodcasts] = useState();
  const [loading, setLoading] = useState(true);  
  const [queue, setQueue] = useState([]);
  const [selection, setSelection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const primaryColor = 'rgb(255, 255, 0)';

  const appState = {
    theme: {
      primaryColor: 'rgb(255, 255, 0)',
    },
    queue: {
      get: queue,
      set: setQueue,
    },
    playback: {
      isPlaying: isPlaying,
      setIsPlaying: setIsPlaying,
      currentEpisode: null,
    }
  }
  
  const filters = [
      {type: "podcastsactivity", desc: t("sorting.podcastsactivity")},
      {type: "episodescount", desc: t("sorting.episodescount")}
    ];
  const filterTypes = filters.map(f => f.type)

  const changeSorting = (n) => {
    setPodcasts(podcasts[filterTypes[n]])
    setSelection(n)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const sorted = await sortPodcasts(filterTypes)
      setSortedPodcasts(sorted)
      setPodcasts(sorted[filterTypes[selection]])
      setLoading(false)
    }
    fetchData()
  }, [])

  let creators = [
    {
      fullname: 'Marton Lederer',
      anshandle: 'martonlederer',
      avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
    }, {
      fullname: 'Marton Lederer',
      anshandle: 'martonlederer',
      avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
    }, {
      fullname: 'Marton Lederer',
      anshandle: 'martonlederer',
      avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
    }
  ]

  // idea: do the podcast color query logic here, then pass the colors down to components
  return (
    <div className="h-full bg-black overflow-hidden">
      <div className="flex h-screen">
        <div>
          <Sidenav />
          <div className="absolute z-10 bottom-0">
            <Player />
          </div>
        </div>
        <div className="grid grid-cols-12 overflow-scroll ml-16 pr-10 pt-9 w-screen">
          <div className="col-span-9">
            <Searchbar />
            <div className="mt-10">
              <h1 className="text-zinc-100 text-xl">Hello, Marton!</h1>
              <p className="text-zinc-400 mb-9">Let's see what we got for today.</p>
              {!loading ? <FeaturedEpisode episode={undefined} podcast={podcasts[0]} /> : <div>Loading...</div>}
              {!loading ? (
                <div className="w-full mt-8 grid grid-cols-3 gap-x-12">
                  {podcasts.splice(0, 3).map((podcast, index) => (
                    <div key={index}>
                      <FeaturedPodcast podcast={podcast} />
                    </div>
                  ))}
                </div>
              ): <div>Loading...</div>}
              
              <div className="mt-9 grid grid-cols-3 gap-x-12">
                <div className="col-span-2">
                  {!loading ? <RecentlyAdded themeColor={primaryColor} podcasts={podcasts} />: <div>Loading...</div>}
                </div>
                <div className="">
                  <FeaturedCreators themeColor={primaryColor} creators={creators} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3 ml-12">
            <ArConnect />
            {!loading ? <EpisodeQueue themeColor={primaryColor} episodes={podcasts.splice(0, 10)} />: <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
