import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { appContext } from "../utils/initStateGen";

export default function Background(props) {
  const appState = useContext(appContext);
  const { themeColor, currentPodcastColor } = appState.theme;
  const location = useLocation();
  // finish the animation for this transition later on
  
  const color = location.pathname.includes("episodes") ? currentPodcastColor?.replace('rgb', 'rgba')?.replace(')', ', 0.4)') : themeColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
  const newColor = color;
  const check = () => location.pathname !== "/featured";

  const transition = {transition: 'opacity 2.5s ease', backgroundImage: `linear-gradient(${newColor}, black)`};
  
  return (
    <div className="w-screen overflow-scroll" style={check() ? transition : {}}>
      {props.children}
    </div>
  )
}
