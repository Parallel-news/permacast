import React from 'react';
import { SearchIcon } from '@heroicons/react/outline';
import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';

export function Searchbar() {
  return (
    <div>
      <form className="relative">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-zinc-600" />
        </div>
        <input
          className="block p-4 pl-10 w-full text-sm placeholder-zinc-600 rounded-full bg-zinc-900 text-zinc-100 outline-none"
          placeholder="Search podcasts"
        />
      </form>
    </div>
  )
}

export function SearchbarMobile() {
  return (
    <div>
      <form className="relative">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-zinc-600" />
        </div>
        <input
          className="block py-2.5 px-3 pl-10 w-full text-sm placeholder-zinc-600 rounded-lg bg-zinc-900 text-zinc-100 outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          placeholder="Search for anything..."
        />
      </form>
    </div>
  )
}