import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';
import { TrackView } from './trackView';

export default function EpisodeQueue() {
  const appState = useContext(appContext);
  
  return (
    <div className="rounded-3xl w-72 text-white h-screen overflow-y-auto p-4 bg-zinc-900">
      <h2 className="text-zinc-500 mb-4">Next up</h2>
      <div className="overflow-y-auto">
        {appState.queue.get().map((episode, index) => (
          <div key={index} className="grid grid-rows-3 mb-[-80px]">
            <TrackView episode={episode} playButtonSize="16" />
          </div>
        ))}
        {appState.queue.get().length === 0 && (
          <div>
            <p className="text text-center text-zinc-400">No episodes in queue, add some!</p>
          </div>
        )}
      </div>
    </div>
  )
}