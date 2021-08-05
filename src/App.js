import { React, Component } from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import './App.css';
import Header from './component/navbar.jsx'
import Podcast from './component/podcast.jsx'
import Index from './component/index.jsx'
import { readContract } from 'smartweave'
import Arweave from 'arweave'

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});


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
