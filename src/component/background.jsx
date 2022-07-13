import { useEffect } from "react";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { appContext } from "../utils/initStateGen";

export default function Background(props) {
  const appState = useContext(appContext);
  const { themeColor, currentPodcastColor, setCurrentPodcastColor } = appState.theme;
  const location = useLocation();
  // TODO re-write this later on
  const color = location.pathname.includes("podcast") && location.pathname.toLowerCase() !== '/uploadpodcast' ? currentPodcastColor?.replace('rgb', 'rgba')?.replace(')', ', 0.4)') : themeColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
  const check = () => location.pathname === "/featured" || location.pathname === "/";

  useEffect(() => {
    if (location.pathname !== '/' || location.pathname !== '/featured') setCurrentPodcastColor(themeColor);  
  }, [location])
  // finish the animation for this transition later on
  const transition = {transition: 'opacity 2.5s ease', backgroundImage: `linear-gradient(${color}, black)`};
  
  return (
    <div className="w-screen overflow-scroll" style={!check() ? transition : {}}>
      {props.children}
    </div>
  )
}
