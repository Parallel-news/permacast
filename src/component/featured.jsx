import React, { useState, useEffect } from 'react';
import FastAverageColor from 'fast-average-color';
import { MESON_ENDPOINT } from '../utils/arweave';
import { replaceDarkColorsRGB, isTooLight, trimANSLabel } from '../utils/ui';
import { convertToPodcast } from '../utils/podcast';
import { Cooyub, PlayButton, GlobalPlayButton } from './icons';
import { EyeIcon } from '@heroicons/react/outline';
import { TrackView } from './trackView';

export function Greeting({appState}) {
  const user = appState.user;
  const label = user.ANSData?.currentLabel
  // what about randomizing greetings?

  return (
    <div>
      <h1 className="text-zinc-100 text-xl">
      {label ? (
        <>
          Hello {trimANSLabel(label) + '!'}
        </>
      ) : 'Welcome!'}
      </h1>
      <p className="text-zinc-400 mb-9">Let's see what we have for today</p>
    </div>
  )
}

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
      // console.log('Average color', color, rgb, rgb2);
    })
    setIsLoading(false)
  }, [])

  return (
    <div className="p-14 flex w-full border border-zinc-800 rounded-[24px]">
      <img className="w-40 cursor-pointer  mr-8" src={episode.cover} alt={episode.title} />
      <div className="col-span-2 my-3 text-zinc-100 max-w-xs md:max-w-lg mr-2">
        <div className="font-medium cursor-pointer line-clamp-1">{episode?.title} - Episode 1</div>
        <div className="text-sm line-clamp-5">{episode?.description}</div>
      </div>
      <div className="ml-auto">
        {!isLoading && dominantColor && (
          <div>
            <div onClick={() => appState.queue.playEpisode(episode)} className="w-24 py-2 pl-4 my-6 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: dominantColor}}>
              <PlayButton svgStyle={dominantColorAlt} fill={dominantColorAlt} outline={dominantColorAlt} />
              <div className="ml-1 " style={{color: dominantColorAlt}}>Play</div>
            </div>
            <div className="w-24 py-2 pl-4 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: dominantColor}}>
              <EyeIcon color={dominantColorAlt} className="h-5 w-5" />
              <div className="ml-1 " style={{color: dominantColorAlt}}>View</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export function FeaturedPodcast({podcast, appState}) {
  // console.log(podcast)
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
      // console.log(isTooLight(rgb), rgb)
      setTextColor(newTextColor);
    })
    setIsLoading(false)
  }, [])

  return (
    <>
      {!isLoading && dominantColor && textColor && (
        <div style={{backgroundColor: dominantColor, color: textColor}} className="mt-4 block xl:last:block md:last:hidden lg:[&:nth-last-child(2)]:block md:[&:nth-last-child(2)]:hidden backdrop-blur-md rounded-[24px]">
          <div className="h-1/6 w-full px-5 pb-2">
            <div className="pt-5 pb-3 text-xs">{podcast.episodesCount} Episode{podcast.episodesCount == 1 ? '' : 's'}</div>
            <div className="w-full mb-7">
              <img className="object-contain h-[180px] w-full" src={podcast.cover} alt={podcast.podcastName} />
            </div>
            <div className="h-16 flex items-center">
              <div onClick={() => {
                appState.queue.enqueuePodcast(podcast.firstTenEpisodes());
                appState.queue.play(podcast.firstTenEpisodes()[0]);
              }}>
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
        <React.Fragment key={index}>
          <FeaturedPodcast podcast={podcast} appState={appState} />
        </React.Fragment>
      ))}
    </>
  )
}

export function RecentlyAdded({episodes, appState}) {
 
  return (
    <div className="">
      <h2 className="text-zinc-400 mb-4">Recently Added</h2>
      <div className="grid grid-rows-3 gap-y-4 text-zinc-100">
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

export function FeaturedView({appState}) {
  const {recentlyAdded, featuredPodcasts, creators} = appState.views.featured; 

  return (
    <div className="overflow-scroll w-full">
      <div>
        <div className="mt-10 pb-20">
          {!appState.loading && (
            <Greeting appState={appState} />
          )}
          {!appState.loading ? (
            <div className="hidden md:block">
              <FeaturedEpisode episode={recentlyAdded[0]} appState={appState} />
            </div>
          ): <div>Loading...</div>}
          {!appState.loading ? (
            <div className="w-full mt-8 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-12">
              <FeaturedPodcasts podcasts={featuredPodcasts} appState={appState} />
            </div>
          ): <div>Loading...</div>}
          <div className="my-9 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-12">
            <div className="xl:col-span-3 lg:col-span-2 md:col-span-1 mb-9">
              {!appState.loading ? (
                <RecentlyAdded episodes={recentlyAdded} appState={appState} />
              ): <div>Loading...</div>}
            </div>
            {!appState.loading ? (
            <div className="w-full">
              <FeaturedCreators creators={creators} appState={appState} />
            </div>
            ) : <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
