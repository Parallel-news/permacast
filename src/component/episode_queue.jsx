import React from 'react';
import { Podcast } from './podcast';

export default function EpisodeQueue({ episodes, themeColor }) {
  return (
    <div className="rounded-[24px] text-white h-5/6 p-4 bg-zinc-900 ">
      <h2 className="text-zinc-500 mb-4">Next up</h2>
      {episodes.map((episode, index) => (
        <div key={index} className="grid grid-rows-3 mb-[-80px]">
          <Podcast podcast={episode} themeColor={themeColor} playButtonSize="16" />
        </div>
      ))}
    </div>
  )
}