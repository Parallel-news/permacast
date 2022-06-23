import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { isDarkMode } from './utils/theme.js';
import { HashRouter as Router, Route } from "react-router-dom";
import Sidenav from "./component/sidenav.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import Player from './component/player.jsx';
import { FeaturedEpisode, FeaturedPodcasts, RecentlyAdded, FeaturedCreators } from './component/featured.jsx';
import { convertToEpisode, convertToPodcast, sortPodcasts } from './utils/podcast.js'


export default function App() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // const [podcasts, setPodcasts] = useState();
  // const [sortedPodcasts, setSortedPodcasts] = useState();
  const [queue, setQueue] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState();

  const appState = {
    themeColor: 'rgb(255, 255, 0)',
    theme: {
    },
    queue: {
      get: () => queue,
      set: setQueue,
      enqueue: (episode) => setQueue([...queue, episode])
    },
    queueHistory: {
      // This can be used for playback history tracking
    },
    playback: {
      isPlaying: isPlaying,
      setIsPlaying: setIsPlaying,
      currentEpisode: null,
    },
    t: t,
    loading: loading,
  }
  
  const filters = [
    {type: "episodescount", desc: t("sorting.episodescount")},
    {type: "podcastsactivity", desc: t("sorting.podcastsactivity")}
  ];
  const filterTypes = filters.map(f => f.type)

  // const changeSorting = (n) => {
  //   setPodcasts(podcasts[filterTypes[n]])
  //   setSelection(n)
  // }

  useEffect(() => {
    const fetchData = async () => {
      console.log('once')
      setLoading(true)
      const sorted = await sortPodcasts(filterTypes)
      const podcasts = sorted[filterTypes[selection]].splice(0, 4)
      const convertedPodcasts = podcasts.map(p => convertToPodcast(p))
      const convertedEpisodes = podcasts.map(p => convertToEpisode(p, p.episodes[0]))
      setRecentlyAdded(convertedEpisodes)
      setFeaturedPodcasts(convertedPodcasts)
      // setSortedPodcasts(sorted)
      // setPodcasts(sorted[filterTypes[selection]])
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
  // Todos: 
  // place queries inside app component
  // add a loading indicator
  // 

  return (
    <div className="h-full bg-black overflow-hidden">
      <div className="flex h-screen">
        <div>
          <Sidenav />
          <div className="absolute z-10 bottom-0">
            <Player />
          </div>
        </div>
        <div className="overflow-scroll ml-16 pr-10 pt-9 w-screen">
          <div>
            <div className="grid grid-cols-5">
              <div className="col-span-4">
                <Searchbar />
              </div>
              <div className="col-span-1">
                <ArConnect />
              </div>
            </div>
            <div className="mt-10">
              <h1 className="text-zinc-100 text-xl">Hello, Marton!</h1>
              <p className="text-zinc-400 mb-9">Let's see what we got for today.</p>
              {!loading ? <FeaturedEpisode episode={recentlyAdded[0]} appState={appState} /> : <div>Loading...</div>}
              {!loading ? (
                <div className="w-full mt-8 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-12">
                  <FeaturedPodcasts podcasts={featuredPodcasts} appState={appState} />
                </div>
              ): <div>Loading...</div>}
              
              <div className="mt-9 grid grid-cols-4 gap-x-12">
                <div className="col-span-3">
                  {!loading ? <RecentlyAdded episodes={recentlyAdded} appState={appState} />: <div>Loading...</div>}
                </div>
                <div className="">
                  <FeaturedCreators creators={creators} appState={appState} />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden absolute right-0 ml-12">
            {!loading ? <EpisodeQueue episodes={queue} appState={appState} />: <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
