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

  async loadPodcasts() {
    console.log('i am here')
    const swcId = 'mvBG00Ccigq9htgOVCdAe9vXM8efbGzm8ax89NIlZS8'
    let res = await readContract(arweave, swcId)
    console.log('res is:')
    console.log(res)//.then((response => console.log(response)))
    return res
  }
  
  render() {
  const allPodcasts = this.state.podcasts
  console.log(allPodcasts)
    return (
    <div>
      <div className="App p-2">
        <Router>
          <div className="topBar"><Header/></div>
          <Route exact path="/podcasts/:podcastId" render={({match}) => <Podcast match={match} podcasts={this.loadPodcasts()}/> } />
          <Route exact path="/" render={() => <Index podcasts={this.loadPodcasts()}/>} /> 
        </Router>
      </div>
    </div>
  );
}
}
