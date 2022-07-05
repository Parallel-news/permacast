import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter as Router, Route } from "react-router-dom";
import { Sidenav, NavBar } from "./component/navbars.jsx";
import SearchResultsView from "./component/search.jsx";
import ArConnect from './component/arconnect.jsx';
import UploadPodcastView from './component/uploadPodcast.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import { Player, PlayerMobile } from './component/player.jsx';
import FeaturedView from './component/featured.jsx';
import { convertToEpisode, convertToPodcast, sortPodcasts } from './utils/podcast.js';
import { appContext } from './utils/initStateGen.js';
import { MOCK_CREATORS } from './utils/ui.js';


export default function App() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(0);

  const playerRef = useRef();
  const videoRef = useRef();
  const playButtonRef = useRef();

  const [currentEpisode, setCurrentEpisode] = useState(null);

  const [themeColor, setThemeColor] = useState('rgb(255, 255, 0)');
  const [backdropColor, setBackdropColor] = useState()
  const [address, setAddress] = useState();
  const [ANSData, setANSData] = useState({address_color: "", currentLabel: "", avatar: ""});
  const [walletConnected, setWalletConnected] = useState(false);

  // const [podcasts, setPodcasts] = useState();
  // const [sortedPodcasts, setSortedPodcasts] = useState();
  const [queue, setQueue] = useState([]);
  const [queueVisible, setQueueVisible] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState();
  const [currentView, setCurrentView] = useState("featured");
  const [searchInput, setSearchInput] = useState("");


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
      setLoading(true)
      const sorted = await sortPodcasts(filterTypes)
      const podcasts = sorted[filterTypes[selection]].splice(0, 4)
      const convertedPodcasts = await Promise.all(podcasts.map(p => convertToPodcast(p)))
      const convertedEpisodes = await Promise.all(podcasts.map(p => convertToEpisode(p, p.episodes[0])))
      setCurrentEpisode(convertedEpisodes[0])
      setRecentlyAdded(convertedEpisodes)
      setFeaturedPodcasts(convertedPodcasts)
      // setSortedPodcasts(sorted)
      // setPodcasts(sorted[filterTypes[selection]])
      setLoading(false)
    }
    fetchData()
  }, [])

  const playEpisode = (episode) => {
    // if (episode.contentUrl === currentEpisode.contentUrl) {
    //   // do something here to trigger a re-render maybe or force a re-render for featured episode
    //   setCurrentEpisode(queue)
    // }
    setCurrentEpisode(episode);
  };

  window.addEventListener('keydown', function(e) {
    if(e.key == " " && e.target == document.body) {
      e.preventDefault();
    }
  });
  // finish this transition later on
  const transition = {transition: 'opacity 2.5s ease', backgroundImage: `linear-gradient(${themeColor.replace('rgb', 'rgba').replace(')', ', 0.2)')}, black)`};
  const appState = {
    t: t,
    loading: loading,
    theme: {},
    themeColor: themeColor,
    backdropColor: backdropColor,
    viewsList: ["featured", "following", "searchResults", "uploadPodcast", "uploadEpisode", "podcast", "episode", "creator", "fullscreen"], 
    currentView: currentView,
    setCurrentView: setCurrentView,
    views: {
      featured: <FeaturedView recentlyAdded={recentlyAdded} featuredPodcasts={featuredPodcasts} creators={MOCK_CREATORS} />,
      following: <h1 className="text-white">following</h1>,
      searchResults: <SearchResultsView />,
      uploadPodcast: <UploadPodcastView />,
      uploadEpisode: <>uploadEpisodeView</>,
      podcast: <>podcastView</>,
      episode: <>episodeView</>,
      creator: <>creatorView</>,
      fullscreen: <>fullscreenView</>,
    },
    search: {
      input: searchInput,
      setInput: setSearchInput,
      isGlobal: currentView === "searchResults",
    },
    user: {
      address: address,
      setAddress: setAddress,
      ANSData: ANSData,
      setANSData: setANSData,
      walletConnected: walletConnected,
      setWalletConnected: setWalletConnected,
    },
    queue: {
      get: () => queue,
      set: setQueue,
      enqueueEpisode: (episode) => setQueue([episode]),
      enqueuePodcast: (episodes) => setQueue(episodes),
      play: (episode) => playEpisode(episode),
      playEpisode: (episode) => {setQueue([episode]); playEpisode(episode)},
      visibility: queueVisible,
      toggleVisibility: () => setQueueVisible(!queueVisible),
    },
    queueHistory: {
      // This can be used for playback history tracking
    },
    playback: {
      player: playerRef.current,
      playerRef: playerRef,
      videoRef: videoRef,
      playButtonRef: playButtonRef,
      currentEpisode: currentEpisode,
    },
  }

  // TODO
  // add a loading skeleton for the app
  // clean up useEffect and appState code
  // add translations
  // improve AR rounding
  // finish tab switching gradient color animation
  // make buttons and stuff consistent accross app
  // add Router
  // mobile view

  return (
    <div className="select-none h-full bg-black overflow-hidden " data-theme="permacast">
      <appContext.Provider value={appState}>
        <div className="flex h-screen">
          <div className="md:hidden absolute z-10 bottom-0 w-screen">
            {!loading ? <PlayerMobile episode={currentEpisode} /> : <div>Loading...</div>}
          </div>
          <div className="hidden md:block">
            <div className="w-[100px] flex justify-center">
              <Sidenav />
            </div>
            <div className="absolute z-20 bottom-0">
              {!loading && currentEpisode ? <Player episode={currentEpisode} />: <div>Loading...</div>}
            </div>
            <div className="absolute z-10 bottom-0 right-0" style={{display: queueVisible ? 'block': 'none'}}>
              {!loading ? <EpisodeQueue />: <div>Loading...</div>}
            </div>
          </div>
          <div className="w-screen overflow-scroll" style={appState.currentView != 'featured' ? transition: {}}>
            <div className="ml-8 pr-8 pt-9">
              <div className="mb-10">
                {!loading ? <NavBar />: <div>Loading...</div>}
              </div>
              <div className="w-full overflow-hidden">
                {appState.views[appState.currentView]}
              </div>
            </div>
          </div>
        </div>
      </appContext.Provider>
    </div>
  );
}

// <Route exact path="/" render={() => <Index />} />
