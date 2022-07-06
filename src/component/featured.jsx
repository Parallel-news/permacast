import React, { useContext } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { replaceDarkColorsRGB, isTooLight, trimANSLabel } from '../utils/ui';
import { Cooyub, PlayButton, GlobalPlayButton } from './icons';
import { EyeIcon } from '@heroicons/react/outline';
import { TrackView } from './trackView';
import { appContext } from '../utils/initStateGen.js';

export function Greeting() {
  const appState = useContext(appContext);
  const user = appState.user;
  const label = user.ANSData?.currentLabel
  // what about randomizing greetings?

  return (
    <div>
      <h1 className="text-zinc-100 text-xl">
      {label ? (
        <>
          Hello {trimANSLabel(label)}!
        </>
      ) : 'Welcome!'}
      </h1>
      <p className="text-zinc-400 mb-9">Let's see what we have for today</p>
    </div>
  )
}

export function FeaturedEpisode({episode}) {
  const appState = useContext(appContext);
  const {cover, title, description} = episode;
  
  const rgb = replaceDarkColorsRGB(episode.rgb);
  const rgb2 = replaceDarkColorsRGB(episode.rgb, 0.6);
  const mainColor = (`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
  const altMainColor = (`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.8)`);

  return (
    <div className="p-14 flex w-full border border-zinc-800 rounded-[24px]">
      <img className="w-40 cursor-pointer  mr-8" src={cover} alt={title} />
      <div className="col-span-2 my-3 text-zinc-100 max-w-xs md:max-w-lg mr-2">
        <div onClick={() => ('')} className="font-medium cursor-pointer line-clamp-1">{title}</div>
        <div className="text-sm line-clamp-5">{description}</div>
      </div>
      <div className="ml-auto">
        <div>
          <div onClick={() => appState.queue.playEpisode(episode)} className="w-24 py-2 pl-4 my-6 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: mainColor}}>
            <PlayButton svgStyle={altMainColor} fill={altMainColor} outline={altMainColor} />
            <div className="ml-1 " style={{color: altMainColor}}>Play</div>
          </div>
          <div className="w-24 py-2 pl-4 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: mainColor}}>
            <EyeIcon color={altMainColor} className="h-5 w-5" />
            <div className="ml-1 " style={{color: altMainColor}}>View</div>
          </div>
        </div>
      </div>
    </div>
  )
}


export function FeaturedPodcast({podcast}) {
  const appState = useContext(appContext);
  const history = useHistory();
  const { rgb, episodesCount, cover, podcastName, title, description, firstTenEpisodes, podcastId } = podcast;
  const textColor = isTooLight(rgb) ? 'black' : 'white';
  const {enqueuePodcast, play} = appState.queue;

  return (
    <>
      <div style={{backgroundColor: rgb, color: textColor}} className="mt-4 backdrop-blur-md rounded-[24px]">
        <div className="h-1/6 w-full px-5 pb-2">
          <div className="pt-5 pb-3 text-xs">{episodesCount} Episode{episodesCount == 1 ? '' : 's'}</div>
          <div className="w-full mb-7">
            <img className="object-contain h-[180px] w-full" src={cover} alt={podcastName} />
          </div>
          <div className="h-16 flex items-center">
            <div onClick={() => {
              enqueuePodcast(firstTenEpisodes());
              play(firstTenEpisodes()[0]);
            }}>
              <GlobalPlayButton size="20" innerColor={rgb} outerColor={textColor} />
            </div>
            <div className="ml-3">
              <div className="text-lg line-clamp-1 cursor-pointer" onClick={() => history.push(`/episodes/${podcastId}`)}>{title}</div>
              <div className="text-xs max-w-[95%] line-clamp-2">{description}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function FeaturedPodcasts({podcasts}) {
  return (
    <>
      {podcasts.map((podcast, index) => (
        <React.Fragment key={index}>
          <FeaturedPodcast podcast={podcast} />
        </React.Fragment>
      ))}
    </>
  )
}

export function FeaturedPodcastsMobile({podcasts}) {
  return (
    <div className="carousel">
      {podcasts.map((podcast, index) => (
        <div className="carousel-item max-w-[280px] md:max-w-xs pr-4" key={index}>
          <FeaturedPodcast podcast={podcast} />
        </div>
      ))}
    </div>
  )
}

export function RecentlyAdded({episodes}) {
  return (
    <div className="">
      <h2 className="text-zinc-400 mb-4">Recently Added</h2>
      <div className="grid grid-rows-3 gap-y-4 text-zinc-100">
        {episodes.map((episode, index) => (
          <div key={index} className="border border-zinc-800 rounded-[24px] p-3 w-full">
            <TrackView episode={episode} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeaturedCreators({creators}) {
  const appState = useContext(appContext);
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

export default function FeaturedView({recentlyAdded, featuredPodcasts, creators}) {
  const appState = useContext(appContext)

  return (
    <div className="overflow-scroll w-full pb-10">
      {!appState.loading ? (
        <Greeting />
      ): <div>Loading...</div>}
      {!appState.loading ? (
        <div className="hidden md:block">
          <FeaturedEpisode episode={recentlyAdded[0]} />
        </div>
      ): <div>Loading...</div>}
      {/* {!appState.loading ? (
        <div className="hidden md:grid w-full mt-8 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-12">
          <FeaturedPodcasts podcasts={featuredPodcasts} />
        </div>
      ): <div>Loading...</div>} */}
      {!appState.loading ? (
        <FeaturedPodcastsMobile podcasts={featuredPodcasts} />
      ): <div>Loading...</div>}
      <div className="my-9 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-12">
        <div className="xl:col-span-3 lg:col-span-2 md:col-span-1 mb-9">
          {!appState.loading ? (
            <RecentlyAdded episodes={recentlyAdded} />
          ): <div>Loading...</div>}
        </div>
        {!appState.loading ? (
          <div className="w-full">
            <FeaturedCreators creators={creators} />
          </div>
        ): <div>Loading...</div>}
      </div>
    </div>
  )
}
