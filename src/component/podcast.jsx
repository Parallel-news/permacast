import { React, Component } from 'react'
import { Button } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import UploadEpisode from './upload_episode.jsx'
import { readContract } from 'smartweave'
import Arweave from 'arweave'

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});

let podcast

class Podcast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            thePodcast: {} // await this.getPodcast()
        }
    }

    getPodcast = async () => {
        let id = this.props.match.params.podcastId;
        let podcasts = await this.loadPodcasts()
        let podcastsWithId = this.linkValues(podcasts)
        let podcast = this.findPodcastById(podcastsWithId, id)
        return podcast
    }

    findPodcastById = (podcasts, id) => {
      for (var i=0, iLen=podcasts.length; i<iLen; i++) {
        if (podcasts[i].id === id)
        console.log(podcasts[i])
          return podcasts[i];
        }
    }

    linkValues = (podcast) => {
      let p = podcast.podcasts
      const keys = Object.keys(p)
      const values =  Object.values(p)
      const resultArr = []
    
      for ( let i = 0 ; i < keys.length ; i++) {
        const currentValues = values[i]
        const currentKey = keys[i]
        currentValues["pid"] = currentKey
        resultArr.push(currentValues)
    
      }
      return resultArr
    }
    

    loadPodcast() {
      const p = this.state.thePodcast 
      const podcastHtml = []
      podcastHtml.push(
          <div>
            <PodcastHtml
            link={p.pid}
            name={p.podcastName}
            description={p.description}
            image={`https://arweave.net/${p.cover}`}
            />
          </div>
      )
      return podcastHtml
    }

    loadEpisodes(p) {
      console.log(p)
      let ep = p
      const episodeList = []
      for (let i in ep) {
        let e = ep[i]
        episodeList.push(
          <div>
            <p>{e.episodeName}</p>
            <p>{e.description}</p>
            <audio controls>
              <source src={`https://arweave.net/${e.audioTx}`} type="audio/mp3"/>
            </audio>
          </div>
        )
      }
      return episodeList
    }

    showEpisodeForm = () => {
      this.setState({showEpisodeForm: true})

    }

    loadPodcasts = async () => {
      const swcId = 'mvBG00Ccigq9htgOVCdAe9vXM8efbGzm8ax89NIlZS8'
      let res = await readContract(arweave, swcId)
      return res
    }  

    async componentDidMount() {
      let p = await this.loadPodcasts()
      this.setState({podcast: p})
      this.setState({thePodcast: await this.getPodcast()})
      let podcastHtml = this.loadPodcast(this.state.thePodcast)
      this.setState({podcastHtml: podcastHtml})
      console.log('state from cDM')
      let podcastEpisodes = this.loadEpisodes(this.state.thePodcast.episodes)
      this.setState({podcastEpisodes: podcastEpisodes})

    }

    render() {
        return(
          <div>
            {/*this.state.thePodcast.owner === sessionStorage.getItem('wallet_address') ? <Button variant="link" onClick={() => this.showEpisodeForm()}>add new episode</Button> : null*/}
            {/*this.state.showEpisodeForm ? <UploadEpisode podcast={this.state.thePodcast}/> : null*/}
            {this.state.podcastHtml}
            {this.state.podcastEpisodes}
          </div>
        )
    }

}

export default Podcast