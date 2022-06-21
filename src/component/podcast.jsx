import { MESON_ENDPOINT } from "../utils/arweave"
import { Cooyub, GlobalPlayButton } from "./icons"
import { shortenAddress } from '../utils/ui'

export function Podcast({podcast, themeColor, playButtonSize="20"}) {
  const bg = themeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')
  let podcastImageURL = `${MESON_ENDPOINT}/${podcast?.cover}`

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img className="w-14 h-14 rounded-lg" src={podcastImageURL} alt={podcast.podcastName} />
        <div className="ml-4 flex flex-col">
          <div className="cursor-pointer line-clamp-1 pr-2 text-sm">{podcast.podcastName}</div>
          <div className="flex items-center">
            <p className="text-zinc-400 text-[6px]">by</p>
            <div style={{backgroundColor: bg}} className="ml-1.5 p-1 rounded-full">
              <div className="flex items-center">
                {/* <img className="h-6 w-6" src={podcast.cover} alt={podcast.podcastName} /> */}
                <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 130, 0)'} />
                <p style={{color: themeColor}} className="text-[8px] pr-1 ml-1 cursor-pointer">@{shortenAddress(podcast.owner)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GlobalPlayButton themeColor={themeColor} size={playButtonSize} />
    </div>
  )
}
