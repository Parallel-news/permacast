import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';

export default function UploadPodcastView() {
  const appState = useContext(appContext);

  return (
    <div className="text-white h-screen">
      <h1 className="text-xl">New Show</h1>
      <div>
        Hello there fellow!
      </div>
    </div>
  )
}