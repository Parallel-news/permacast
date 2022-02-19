import { React, Component } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import Header from "./component/navbar.jsx";
import Podcast from "./component/podcast.jsx";
import Index from "./component/index.jsx";
import PodcastRss from "./component/podcast_rss.jsx";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col h-screen font-mono">
        <Router>
          <Header />
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
}
