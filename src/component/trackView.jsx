import { useContext } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { FaPlay } from 'react-icons/fa';
import { Cooyub } from './icons';
import { appContext } from '../utils/initStateGen';
import { getButtonRGBs } from './../utils/ui';
import { MESON_ENDPOINT } from "../utils/arweave";

export function TrackView({episode, includeDescription=false, playButtonSize="20", color=""}) {
  const appState = useContext(appContext);
  const history = useHistory();
  const { cover, title, creatorName, description } = episode;
  const queue = appState.queue;
  const c = color ? color : episode?.rgb;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img className="w-14 h-14 rounded-lg" src={cover} alt={title} />
        <div className="ml-4 flex flex-col">
          <div className="cursor-pointer line-clamp-1 pr-2 text-sm" onClick={() => history.push(`/episode/${1}`)}>{title}</div>
          <div className="flex items-center">
            {creatorName && (
              <>
                <p className="text-zinc-400 text-[8px]">by</p>
                <div style={{backgroundColor: getButtonRGBs(c)?.backgroundColor}} className="ml-1.5 p-1 rounded-full">
                  <div className="flex items-center">
                    {/* <img className="h-6 w-6" src={cover} alt={title} /> */}
                    <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 130, 0)'} />
                    <p style={{color: getButtonRGBs(c)?.color}} className="text-[8px] pr-1 ml-1 cursor-pointer ">@{creatorName}</p>
                  </div>
                </div>
              </>
            )}
            {includeDescription && description && (
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