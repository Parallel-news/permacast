import React from 'react';
import { SearchIcon } from '@heroicons/react/outline';

export default function Searchbar() {
  return (
    <form className="px-20">
      <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900">Search</label>
      <div className="relative">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5" />
        </div>
        <input type="search" id="default-search" className="block p-4 pl-10 w-full text-sm text-gray-900 rounded-lg border border-gray-300 bg-inherit" placeholder="Search for anything..." />
      </div>
    </form>
  )
}