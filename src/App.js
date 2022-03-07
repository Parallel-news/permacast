import { HashRouter as Router, Route } from "react-router-dom";
import NavBar from "./component/navbar.jsx";
import Podcast from "./component/podcast.jsx";
import Index from "./component/index.jsx";
import PodcastRss from "./component/podcast_rss.jsx";

export default function App() {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col h-screen font-mono">
      <Router>
        <NavBar />
        <Route
          exact
          path="/podcasts/:podcastId"
          render={({ match }) => <Podcast match={match} />}
        />
        <Route exact path="/" render={() => <Index />} />
        <Route
          exact
          path="/podcasts/:podcastId/rss"
          render={({ match }) => <PodcastRss match={match} />}
        />
      </Router>
    </div>
  );
}
