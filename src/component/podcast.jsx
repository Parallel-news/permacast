import { MESON_ENDPOINT } from "../utils/arweave"
import { Cooyub, GlobalPlayButton } from "./icons"

export function Podcast({podcast, themeColor, playButtonSize="20"}) {
  const bg = themeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')
  let podcastImageURL = `${MESON_ENDPOINT}/${podcast?.cover}`
  let truncatedAddress = podcast.owner.substring(0, 4) + "..." + podcast.owner.substr(-4)
  if (podcast.owner) {
    // ans check
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12">
          <img className="rounded-md h-full w-full" src={podcastImageURL} alt={podcast.podcastName} />
        </div>
        <div className="ml-4 flex flex-col">
          <div className="cursor-pointer line-clamp-1">{podcast.podcastName}</div>
          <div className="flex items-center">
            <p className="text-zinc-400 text-[6px]">by</p>
            <div style={{backgroundColor: bg}} className="ml-1.5 p-1 rounded-full">
              <div className="flex items-center">
                {/* <img className="h-6 w-6" src={podcast.cover} alt={podcast.podcastName} /> */}
                <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 130, 0)'} />
                <p style={{color: themeColor}} className="text-[8px] ml-1 cursor-pointer">@{truncatedAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GlobalPlayButton themeColor={themeColor} size={playButtonSize} />
    </div>
  )
}
