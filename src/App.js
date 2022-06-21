import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter as Router, Route } from "react-router-dom";
import Sidenav from "./component/sidenav.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import Player from './component/player.jsx';
import { FeaturedEpisode, FeaturedPodcasts, RecentlyAdded, FeaturedCreators } from './component/featured.jsx';
import { sortPodcasts } from './utils/podcast.js'


export default function App() {
  const { t } = useTranslation()

  const [podcasts, setPodcasts] = useState();
  const [sortedPodcasts, setSortedPodcasts] = useState();
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('rgb(255, 255, 0)');

  const [selection, setSelection] = useState(0)
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
        <div className="grid grid-cols-12 overflow-scroll ml-16 mr-10 pt-9 w-screen">
          <div className="col-span-9">
            <Searchbar />
            <div className="mt-10">
              <h1 className="text-zinc-100 text-xl">Hello, Marton!</h1>
              <p className="text-zinc-400 mb-9">Let's see what we got for today.</p>
              <FeaturedEpisode episode={undefined} podcast={undefined} />
              {!loading ? <FeaturedPodcasts podcasts={podcasts} /> : <div>Loading...</div>}
              <div className="mt-9 grid grid-cols-3 gap-x-24">
                <div className="col-span-2">
                {!loading ? <RecentlyAdded themeColor={primaryColor} podcasts={podcasts} />: <div>Loading...</div>}
                </div>
                <div className="">
                  <FeaturedCreators themeColor={primaryColor} creators={undefined} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3 ml-12">
            <ArConnect />
            {!loading ? <EpisodeQueue episodes={podcasts} themeColor={primaryColor} /> : <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
// <Route exact path="/" render={() => <Index />} />
