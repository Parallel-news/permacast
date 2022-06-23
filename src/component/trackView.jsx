import { Cooyub, GlobalPlayButton } from "./icons";

export function TrackView({episode, appState, includeDescription=false, playButtonSize="20"}) {
  const bg = appState.themeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')
  const queue = appState.queue;
  const enqueue = () => queue.set([...queue.get(), episode])

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img className="w-14 h-14 rounded-lg" src={episode.cover} alt={episode.title} />
        <div className="ml-4 flex flex-col">
          <div className="cursor-pointer line-clamp-1 pr-2 text-sm">{episode.title}</div>
          <div className="flex items-center">
            <p className="text-zinc-400 text-[6px]">by</p>
            <div style={{backgroundColor: bg}} className="ml-1.5 p-1 rounded-full">
              <div className="flex items-center">
                {/* <img className="h-6 w-6" src={podcast.cover} alt={podcast.podcastName} /> */}
                <Cooyub className="rounded-full" svgStyle="h-2 w-2" rectStyle="h-6 w-6" fill={'rgb(255, 130, 0)'} />
                <p style={{color: appState.themeColor}} className="text-[8px] pr-1 ml-1 cursor-pointer">@{episode.creator}</p>
              </div>
            </div>
            {includeDescription && (
              <div className="w-full line-clamp-1">
                {episode.description}
              </div>            
            )}
          </div>
        </div>
      </div>
      {playButtonSize == 0 ? null : (
        <div onClick={enqueue}>
          <GlobalPlayButton appState={appState} size={playButtonSize} />
        </div>      
      )}
    </div>
  )
}