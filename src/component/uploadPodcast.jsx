import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';

export default function UploadPodcastView({props}) {
  const appState = useContext(appContext);

  return (
    <div className="text-white">
      <h1>upload podcast</h1>
      <div>
        Hello there fellow!
      </div>
    </div>
  )
}