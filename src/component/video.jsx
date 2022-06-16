import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';


export const VideoJS = ({options}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  const onReady = (player) => {
    playerRef.current = player;
    window.addEventListener('keydown', (event) => {
      console.log(event.key)
      if (event.key == 'ArrowLeft') {
        player.currentTime(player.currentTime() - 5)  
      }
      if (event.key == 'ArrowRight') {
        player.currentTime(player.currentTime() + 5)
      }
      if (event.key == ' ') {
        player.paused() ? player.play() : player.pause()
      }
    })
  };
  
  useEffect(() => {

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;

      if (!videoElement) return;

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
      // videojs.getComponent('SeekBar')
      

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      // const player = playerRef.current;

      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options, videoRef]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className='video-js vjs-big-play-centered' />
    </div>
  );
}

export default VideoJS;