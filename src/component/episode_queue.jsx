import React from 'react';
import { TrackView } from './episodePreview';

export default function EpisodeQueue({ episodes, appState }) {
  
  return (
    <div className="rounded-[24px] text-white h-5/6 p-4 bg-zinc-900 ">
      <h2 className="text-zinc-500 mb-4">Next up</h2>
      {episodes.map((episode, index) => (
        <div key={index} className="grid grid-rows-3 mb-[-80px]">
          <TrackView episode={episode} appState={appState} playButtonSize="16" />
        </div>
      ))}
    </div>
  )
}