import { TrackView } from "./trackView";
import { ViewListIcon, ShareIcon, ArrowsExpandIcon } from "@heroicons/react/solid";

export default function Player({episode, appState}) {

  return (
    <div className="w-screen rounded-t-[24px] h-[84px] pt-4 px-8 bg-zinc-900 text-zinc-200">
      <div className="flex justify-between">
        {!appState.loading && (
          <>
            <TrackView episode={episode} appState={appState} playButtonSize="0" />
          </>
        )}
        <div className="text-zinc-400 w-28 flex items-center justify-center ">
          <ShareIcon width="28" height="28" />
          <ViewListIcon onClick={() => appState.queue.toggleVisibility()} width="28" height="28" />
          <ArrowsExpandIcon width="28" height="28" />
        </div>
      </div>
    </div>
  )
}