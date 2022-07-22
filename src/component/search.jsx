import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/outline';
import { appContext } from '../utils/initStateGen';
import { TrackView } from './trackView';

export function Searchbar() {
  const appState = useContext(appContext);
  const {input, setInput} = appState.search;
  const history = useHistory();
  const location = useLocation();

  return (
    <div>
      <form className="relative">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pr-10 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-zinc-600 focus:text-white" />
        </div>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (!location.pathname.includes("search")) history.push("/search");
          }}
          className="input input-secondary block pl-10 py-2.5 md:py-[14px] text-xs md:text-base w-full placeholder-zinc-600 focus:placeholder-white rounded-lg md:rounded-full bg-zinc-900 text-zinc-100 outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          placeholder="Search for anything..."
        />
      </form>
    </div>
  )
}

export default function SearchView() {
  const appState = useContext(appContext);
  const {input, titles} = appState.search;

  const filteredPodcasts = titles.filter((p) => {
    if (input === '') return;
    if (p.type === "eid") return;
    else return p.title.toLowerCase().includes(input.toLowerCase());
  })
  const filteredEpisodes = titles.filter((p) => {
    if (input === '') return;
    if (p.type === "pid") return;
    else return p.title.toLowerCase().includes(input.toLowerCase());
  })

  return (
    <div className="text-white h-full pb-80">
      {input.length !== 0 ?
        (
          <>
            <div className="text-2xl text-white font-bold mb-6">Podcasts</div>
            {filteredPodcasts.length !== 0 ? (
              <>
                {filteredPodcasts?.map((filtered, idx) => (
                  <div key={idx} className="mb-6 p-2.5 border rounded-xl border-zinc-600">
                    <TrackView episode={filtered} />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-2xl text-white font-bold mb-12">No podcasts found</div>
            )}
            <div className="text-2xl text-white font-bold mb-6">Episodes</div>
            {filteredEpisodes.length !== 0 ? (
              <>
                {filteredEpisodes?.map((filtered, idx) => (
                  <div key={idx} className="mb-6 p-2.5 border rounded-xl border-zinc-600">
                    <TrackView episode={filtered} />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-2xl text-white font-bold mb-12">No Episodes found</div>
            )}
          </>
        )
        :
        (
          <div className="text-center text-white text-2xl">
            Start typing to search for podcasts or episodes...
          </div>
        )
      }
    </div>
  )
}