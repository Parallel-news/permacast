import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Cooyub, GlobalPlayButton } from './icons';
import { appContext } from '../utils/initStateGen';
import { getButtonRGBs } from './../utils/ui';
import { FaPlay } from 'react-icons/fa';

export function TrackView({episode, includeDescription=false, playButtonSize="20"}) {
  const appState = useContext(appContext);
  const location = useLocation();
  const { currentPodcastColor } = appState.theme;
  const { cover, title, creatorName, description } = episode;
  const queue = appState.queue;
  const c = currentPodcastColor;

  return (
    <div className="flex items-center justify-between ">
      <div className="flex items-center">
        <img className="w-14 h-14 rounded-lg" src={cover} alt={title} />
        <div className="ml-4 flex flex-col">
          <div className="cursor-pointer line-clamp-1 pr-2 text-sm">{title}</div>
          <div className="flex items-center">
            <p className="text-zinc-400 text-[6px]">by</p>
            <div style={{backgroundColor: getButtonRGBs(c)?.backgroundColor}} className="ml-1.5 p-1 rounded-full">
              <div className="flex items-center">
                {/* <img className="h-6 w-6" src={cover} alt={title} /> */}
                <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 130, 0)'} />
                <p style={{color: getButtonRGBs(c)?.color}} className="text-[8px] pr-1 ml-1 cursor-pointer ">@{creatorName}</p>
              </div>
            </div>
            {includeDescription && (
              <div className="w-full line-clamp-1">
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
      {playButtonSize == 0 ? null : (
        <div onClick={() => queue.playEpisode(episode)}>
          <div className="cursor-pointer rounded-[34px] p-3" style={getButtonRGBs(c)}>
            <FaPlay className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  )
}