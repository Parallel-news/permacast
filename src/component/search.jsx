import React from 'react';
import { SearchIcon } from '@heroicons/react/outline';
import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';

export function Searchbar() {
  const appState = useContext(appContext);
  const {input, setInput} = appState.search;

  return (
    <div>
      <form className="relative">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pr-10 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-zinc-600" />
        </div>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            appState.setCurrentView("searchResults")
          }}
          className="block pl-10 py-2.5 md:py-[14px] text-xs md:text-base w-full placeholder-zinc-600 rounded-lg md:rounded-full bg-zinc-900 text-zinc-100 outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          placeholder="Search for anything..."
        />
      </form>
    </div>
  )
}

export default function SearchResultsView() {
  const appState = useContext(appContext);

  return (
    <div className="text-white">
      Search
    </div>
  )
}