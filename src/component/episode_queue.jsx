import React from 'react';
import { TrackView } from './trackView';

export default function EpisodeQueue({ episodes, appState }) {
  
  return (
    <div className="rounded-[24px] w-72 text-white h-screen p-4 bg-zinc-900">
      <h2 className="text-zinc-500 mb-4">Next up</h2>
      <div className="overflow-y-auto">
        {episodes.map((episode, index) => (
          <div key={index} className="grid grid-rows-3 mb-[-80px]">
            <TrackView episode={episode} appState={appState} playButtonSize="16" />
          </div>
        ))}
        {episodes.length === 0 && (
          <div>
            <p className="text text-center text-zinc-400">No episodes in queue, add some!</p>
          </div>
        )}
      </div>
    </div>
  )
}