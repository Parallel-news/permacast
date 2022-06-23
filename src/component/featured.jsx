import React, { useState, useEffect } from 'react';
import FastAverageColor from 'fast-average-color';
import { MESON_ENDPOINT } from '../utils/arweave';
import { replaceDarkColorsRGB, isTooLight } from '../utils/ui';
import { convertToPodcast } from '../utils/podcast';
import { Cooyub, PlayButton, GlobalPlayButton } from './icons';
import { EyeIcon } from '@heroicons/react/outline';
import { TrackView } from './trackView';

export function FeaturedEpisode({episode, appState}) {
  const [dominantColor, setDominantColor] = useState();
  const [dominantColorAlt, setDominantColorAlt] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true)
    const fac = new FastAverageColor();
    fac.getColorAsync(episode.cover).then(color => {
      const rgb = replaceDarkColorsRGB(color.rgb)
      const rgb2 = replaceDarkColorsRGB(color.rgb, 0.6)
      setDominantColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
      setDominantColorAlt(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.8)`);
      console.log('Average color', color, rgb, rgb2);
    })
    setIsLoading(false)
  }, [])

  return (
    <div className="p-14 grid grid-cols-4 border border-zinc-800 rounded-[24px]">
      <img className="w-40 h-40 cursor-pointer mr-4" src={episode.cover} alt={episode.title} />
      <div className="col-span-2 my-3 text-zinc-100 max-w-md">
        <div className="text-xl font-medium cursor-pointer">{episode?.title} - Episode 1</div>
        <div className="text-sm line-clamp-5">{episode?.description}</div>
      </div>
      <div className="ml-20">
        <div className="mt-4">
          {!isLoading && dominantColor && (
            <div>
              <div onClick={() => appState.queue.enqueue(episode)} className="w-24 py-2 pl-4 my-6 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: dominantColor}}>
                <PlayButton svgStyle={dominantColorAlt} fill={dominantColorAlt} outline={dominantColorAlt} />
                <div className="ml-1 select-none" style={{color: dominantColorAlt}}>Play</div>
              </div>
              <div className="w-24 py-2 pl-4 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: dominantColor}}>
                <EyeIcon color={dominantColorAlt} className="h-5 w-5" />
                <div className="ml-1 select-none" style={{color: dominantColorAlt}}>View</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export function FeaturedPodcast({podcast, appState}) {
  console.log(podcast)
  const [dominantColor, setDominantColor] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [textColor, setTextColor] = useState();

  useEffect(() => {
    setIsLoading(true)
    const fac = new FastAverageColor();
    fac.getColorAsync(podcast.cover).then(color => {
      const rgb = replaceDarkColorsRGB(color.rgb)
      setDominantColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      const newTextColor = isTooLight(rgb) ? 'black' : 'white'
      console.log(isTooLight(rgb), rgb)
      setTextColor(newTextColor);
    })
    setIsLoading(false)
  }, [])

  return (
    <>
      {!isLoading && dominantColor && textColor && (
        <div style={{backgroundColor: dominantColor, color: textColor}} className="block xl:last:block sm:last:hidden lg:[&:nth-last-child(2)]:block sm:[&:nth-last-child(2)]:hidden  backdrop-blur-md rounded-[24px]">
          <div className="h-1/6 w-full px-5 pb-2">
            <div className="pt-5 pb-3 text-xs">{podcast.episodes} Episode{podcast.episodes == 1 ? '' : 's'}</div>
            <div className="w-full mb-11">
              <img className="object-contain h-[180px] w-full" src={podcast.cover} alt={podcast.podcastName} />
            </div>
            <div className="h-16 flex items-center">
              <div onClick={() => appState.queue.enqueue(podcast)}>
                <GlobalPlayButton appState={appState} size="20" innerColor={dominantColor} outerColor={textColor} />
              </div>
              <div className="ml-3">
                <div className="text-lg line-clamp-1">{podcast.title}</div>
                <div className="text-xs max-w-[85%] line-clamp-2">{podcast.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function FeaturedPodcasts({podcasts, appState}) {
  return (
    <>
      {podcasts.map((podcast, index) => (
        <>
          <FeaturedPodcast key={index} podcast={podcast} appState={appState} />
        </>
      ))}
    </>
  )
}

export function RecentlyAdded({episodes, appState}) {
 
  return (
    <div>
      <h2 className="text-zinc-400 mb-4">Recently Added</h2>
      <div className="grid grid-rows-3 gap-y-4 pb-40 text-zinc-100">
        {episodes.map((episode, index) => (
          <div key={index} className="border border-zinc-800 rounded-[24px] p-3 w-full">
            <TrackView episode={episode} appState={appState} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeaturedCreators({creators, appState}) {
  const bg = appState.themeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')

  return (
    <div>
      <h2 className="text-zinc-400 mb-4">Featured Creators</h2>
      {creators.map((creator, index) => (
        <div key={index} className="flex justify-between items-center py-4 mb-4">
          <div className="flex">
            {creator?.avatar ? (
              <img className="rounded-lg h-12 w-12" src={creator.avatar} alt={creator.fullname} />
              ) : (
                <Cooyub svgStyle="rounded-lg h-12 w-12" rectStyle="h-6 w-6" fill={'rgb(255, 80, 0)'} />
              )
            }
            <div className="ml-4 flex items-center">
              <div className="flex flex-col">
                <div className="text-zinc-100 text-sm cursor-pointer">{creator.fullname}</div>
                <div className="text-zinc-400 cursor-pointer text-[8px]">@{creator.anshandle}</div>
              </div>
              <div className=" ">
                <p style={{backgroundColor: bg, color: appState.themeColor}} className="px-3 py-2 rounded-full text-[10px] ml-5 cursor-pointer">{appState.t("view")}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
