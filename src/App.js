import { React, Component } from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import './App.css';
import Header from './component/navbar.jsx'
import Podcast from './component/podcast.jsx'
import Index from './component/index.jsx'

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
    <div>
      <div className="App p-2">
        <Router>
          <div className="topBar"><Header/></div>
          <Route exact path="/podcasts/:podcastId" render={({match}) => <Podcast match={match}/> } />
          <Route exact path="/" render={() => <Index/> }/> 
        </Router>
      </div>
    </div>
  );
}
}
