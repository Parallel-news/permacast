import React, { useState, useEffect } from 'react';
import { MESON_ENDPOINT } from '../utils/arweave';
import { RGBtoHSL, HSLtoRGB, replaceDarkColorsRGB } from '../utils/ui';
import FastAverageColor from 'fast-average-color';
import Cooyub from './cooyub';
import { EyeIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';

function PlayButton ({svgStyle, fill, outline, size="20"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill={svgStyle} xmlns="http://www.w3.org/2000/svg">
      <path d="M13 9L5 4V14L13 9Z" fill={fill} stroke={outline} strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

let podcas = [
  {
    podcastName: 'The Gentlemen',
    cover: 'https://upload.wikimedia.org/wikipedia/en/0/06/The_Gentlemen_poster.jpg',
    episodes: 18,
    description: 'Funny British Accent',
    owner: 'GuyRitchie'
  }, {
    podcastName: 'Donnie Darko',
    cover: 'https://upload.wikimedia.org/wikipedia/en/d/db/Donnie_Darko_poster.jpg',
    episodes: 18,
    description: 'Time travelling is cool',
    owner: 'RichardKelly'
  }, {
    podcastName: 'The Prestige',
    cover: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg',
    episodes: 18,
    description: 'Amazing twist, gripping story',
    owner: 'ChristopherNolan'
  }
]

export function FeaturedEpisode(podcast, episode) {
  const [dominantColor, setDominantColor] = useState();
  const [dominantColorAlt, setDominantColorAlt] = useState();
  const [isLoading, setIsLoading] = useState(false);
  let podcastImageURL = `${MESON_ENDPOINT}/${podcast?.cover}`

  useEffect(() => {
    setIsLoading(true)
    const fac = new FastAverageColor();
    podcastImageURL = "https://m.media-amazon.com/images/I/31Lur+LEP-S._AC_SL1500_.jpg"
    fac.getColorAsync(podcastImageURL).then(color => {
      const rgb = replaceDarkColorsRGB(color.rgb)
      const rgb2 = replaceDarkColorsRGB(color.rgb, 0.6)
      setDominantColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`);
      setDominantColorAlt(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.8)`);
      console.log('Average color', color, rgb, rgb2);
    })
    setIsLoading(false)
  }, [])

  return (
    <div className="p-14 grid grid-cols-4 border border-zinc-800 rounded-[24px]">
      {podcast?.cover ? 
        <img className="cursor-pointer" src={podcastImageURL} alt={podcast.podcastName} />
        :
        <Cooyub svgStyle="w-40 h-40 rounded-sm cursor-pointer" rectStyle="w-40 h-40" fill="lightskyblue" />
      }
      <div className="col-span-2 my-3 text-zinc-100 max-w-sm">
        <div className="text-xl font-medium cursor-pointer">{episode?.title ||'ETH All Core Devs - Episode 4'}</div>
        <div className="text-sm line-clamp-5">{episode?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquam vel amet elit rhoncus dolor. Sit volutpat imperdiet ipsum, fermentum massa quam ultrices pulvinar. In blandit ut elit eu mi dolor sapien turpis eu. Aliquam sed habitasse pharetra, donec dignissim. Vitae pellentesque nunc non nunc integer id nisl. Nunc ante id sagittis sed lacus. Quisque non, sit cras urna eget blandit. Eget diam iaculis eu quis morbi a elit. Sit cursus pharetra, tellus, montes.' }</div>
      </div>
      <div className="ml-20">
        <div className="mt-4">
          {!isLoading && dominantColor && (
            <div>
              <div className="w-24 py-2 pl-4 my-6 rounded-full flex items-center cursor-pointer backdrop-blur-md" style={{backgroundColor: dominantColor}}>
                <PlayButton svgStyle={dominantColor} fill={dominantColorAlt} outline={dominantColorAlt} />
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


export function FeaturedPodcasts (podcasts) {

  return (
    <div className="w-full mt-8 grid grid-cols-3 gap-x-24">
      {podcas.map((podcast, index) => (
        <div key={index}>
          <FeaturedPodcast podcast={podcast} />
        </div>
      ))}
    </div>
  )
}

export function FeaturedPodcast({podcast}) {
  console.log(podcast)
  const [dominantColor, setDominantColor] = useState();
  const [isLoading, setIsLoading] = useState(false);
  // let podcastImageURL = `${MESON_ENDPOINT}/${podcast?.cover}`

  useEffect(() => {
    setIsLoading(true)
    const fac = new FastAverageColor();
    fac.getColorAsync(podcast.cover).then(color => {
      const rgb = replaceDarkColorsRGB(color.rgb)
      setDominantColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    })
    setIsLoading(false)
  }, [])

  return (
    <>
      {!isLoading && dominantColor && (
        <div style={{backgroundColor: dominantColor}} className="backdrop-blur-md rounded-[24px]">
          <div className="h-1/6 w-full px-5 pb-2">
            <div className="text-zinc-100 pt-5 pb-3 text-xs">{podcast.episodes} Episodes</div>
            <div className="w-full mb-11">
              <img className="object-contain h-[180px] w-full" src={podcast.cover} alt={podcast.podcastName} />
            </div>
            <div className="h-16 flex items-center">
              <div className="p-2 bg-white cursor-pointer rounded-[34px]">
                <PlayButton className="pl-0.5" svgStyle={dominantColor} fill={dominantColor} outline={dominantColor} />
              </div>
              <div className="ml-3">
                <div className="text-zinc-100 text-lg line-clamp-1">{podcast.podcastName}</div>
                <div className="text-zinc-200 text-xs line-clamp-2 pr-0.5">{podcast.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function RecentlyAdded({podcasts, themeColor}) {
  const bg = themeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')

  return (
    <div>
      <h2 className="text-zinc-400 mb-4">Recently Added</h2>
      <div className="grid grid-rows-3 gap-y-4 pb-40 text-zinc-100">
        {podcas.map((podcast, index) => (
          <div key={index} className="border border-zinc-800 rounded-[24px] p-4 w-full flex">
            <div className="w-12 h-12">
              <img className="rounded-md h-full w-full" src={podcast.cover} alt={podcast.podcastName} />
            </div>
            <div className="ml-4 flex flex-col">
              <div className="text-lg">{podcast.podcastName}</div>
              <div className="flex items-center">
                <p className="text-zinc-400 text-[6px]">by</p>
                  <div style={{backgroundColor: bg}} className="ml-1.5 p-1 rounded-full">
                    <div className="flex items-center">
                      {/* <img className="h-6 w-6" src={podcast.cover} alt={podcast.podcastName} /> */}
                      <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 0, 0)'} />
                      <p style={{color: themeColor}} className="text-[6px] ml-1">@{podcast.owner}</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeaturedCreators({color, creators}) {
  return (
    <div>
      <h2 className="text-zinc-400">Featured Creators</h2>
    </div>
  )
}
