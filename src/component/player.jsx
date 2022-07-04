import { useState, useEffect, useRef, useContext } from 'react';

import { TrackView } from './trackView';
import { GlobalPlayButton } from './icons';
import { ViewListIcon, ShareIcon, ArrowsExpandIcon, PauseIcon, VolumeUpIcon, FastForwardIcon, RewindIcon } from "@heroicons/react/outline";
import { appContext } from '../utils/initStateGen';

const AudioPlayer = ({ url }) => {
  const appState = useContext(appContext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);

  const audioRef = useRef(new Audio(url));
  audioRef.current.preload = true;

  const intervalRef = useRef();
  const isReady = useRef(false);

  // Destructure for conciseness
  const { duration } = audioRef.current;
  
  const time = duration ? `${Math.floor(trackProgress / 60)}:${Math.floor(trackProgress % 60)}`: '00:00';
  const timeLeft = duration ? `${Math.floor((duration) / 60)}:${Math.floor((duration) % 60)}` : '00:00';

  const onReady = () => {
    let player = audioRef.current;
    window.addEventListener('keydown', (event) => {
      console.log(event.key)
      if (event.key == 'ArrowLeft') {
        player.currentTime(player.currentTime() - 5);
      }
      if (event.key == 'ArrowRight') {
        player.currentTime(player.currentTime() + 5);
      }
      if (event.key == ' ') {
        setIsPlaying(!isPlaying);
      }
    })
  }


  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        toNextTrack();
      } else {
        setTrackProgress(audioRef.current.currentTime);
      }
    }, [1000]);
  };

  const onScrub = (value) => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    audioRef.current.currentTime = value;
    setTrackProgress(audioRef.current.currentTime);
  };

  const onScrubEnd = () => {
    // If not already playing, start
    if (!isPlaying) {
      setTimeout(() => {
        setIsPlaying(true);
      }, 100)
    }
    startTimer();
  };

  const toPrevTrack = () => {
    // if (trackIndex - 1 < 0) {
    //   setTrackIndex(tracks.length - 1);
    // } else {
    //   setTrackIndex(trackIndex - 1);
    // }
  };

  const toNextTrack = () => {
    // if (trackIndex < tracks.length - 1) {
    //   setTrackIndex(trackIndex + 1);
    // } else {
    //   setTrackIndex(0);
    // }
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
      startTimer();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handles cleanup and setup when changing tracks
  useEffect(() => {
    audioRef.current.pause();
    audioRef.current = new Audio(url);
    audioRef.current.preload = true;
    setTrackProgress(audioRef.current.currentTime);

    if (isReady.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startTimer();
    } else {
      // Set the isReady ref as true for the next pass
      isReady.current = true;
    }
  }, [appState.playback.currentEpisode]);

  useEffect(() => {
    // Pause and clean up on unmount
    return () => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="w-28 mx-auto">
        <AudioControls
          isPlaying={isPlaying}
          onPrevClick={toPrevTrack}
          onNextClick={toNextTrack}
          onPlayPauseClick={setIsPlaying}
        />
      </div>
      <div className=" flex">
        <span>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export function AudioControls ({isPlaying, onPlayPauseClick, onPrevClick, onNextClick}) {
  return (
    <div className="w-full flex justify-between">
      <button
        type="button"
        className="prev"
        aria-label="Previous"
        onClick={onPrevClick}
      >
        <RewindIcon height="28" width="28" />
      </button>
      {isPlaying ? (
        <button
          type="button"
          onClick={() => onPlayPauseClick(false)}
          aria-label="Pause"
        >
          <PauseIcon height="28" width="28" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onPlayPauseClick(true)}
          aria-label="Play"
        >
          <GlobalPlayButton size="14" />
        </button>
      )}
      <button
        type="button"
        aria-label="Next"
        onClick={onNextClick}
      >
        <FastForwardIcon height="28" width="28" />
      </button>
    </div>
  )
}

export function PlayerMobile({ episode }) {
  // only visual for now
  const appState = useContext(appContext);

  return (
    <div className="w-full h-20 pt-2 px-4 rounded-t-md bg-zinc-900 text-zinc-200 overflow-y-hidden flex items-center">
      <div className="flex-1">
        <TrackView episode={episode} playButtonSize="0" />
      </div>
      <div className="flex items-center text-zinc-400">
         <GlobalPlayButton size="14" />
         <ViewListIcon onClick={() => appState.queue.toggleVisibility()} width="28" height="28" />
      </div>
    </div>
  )
};

export function Player({episode}) {
  const appState = useContext(appContext);

  return (
    <div className="w-screen rounded-t-[24px] h-[84px] pt-4 px-8 bg-zinc-900 text-zinc-200 overflow-y-hidden">
      <div className="grid grid-cols-12 items-center justify-between">
        <div className="col-span-3">
          <TrackView episode={episode} playButtonSize="0" />
        </div>
        <div className="col-span-6">
          <div className="flex">
            <AudioPlayer
              url={episode.contentUrl}
            />
          </div>
        </div>
        <div className="col-span-3 text-zinc-400 ">
          <div className="flex items-center justify-center">
            <VolumeUpIcon width="28" height="28" />
            <ShareIcon width="28" height="28" />
            <ViewListIcon onClick={() => appState.queue.toggleVisibility()} width="28" height="28" />
            <ArrowsExpandIcon width="28" height="28" />
          </div>
        </div>
      </div>
    </div>
  )
}
