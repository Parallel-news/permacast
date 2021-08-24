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


const queryObject = {
  query: 
    `query {
transactions(
tags: [
    
    { name: "Contract-Src", values: "3-mBKpDjBTzmRWiQ8U0rtW5oe6Ky6IQYFh7qDsOd4-0"},
  
    ]
first: 1000000
) {
edges {
  node {
    id
  }
}
}
}
`
}

class Podcast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            thePodcast: {} // await this.getPodcast()
        }
    }

    fetchAllSwcIds = async () => {
      const response = await fetch("https://arweave.net/graphql", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryObject),
      });
  
      const json = await response.json();
      console.log(json)
      const data_arr = [];
  
      const res_arr = json["data"]["transactions"]["edges"];
  
      for (let element in Object.values(res_arr)) {
        data_arr.push(res_arr[element]["node"]["id"])
      }
      return data_arr
    }
  
    loadPodcasts = async (tx) => {
      let podcastList = []
      for (let i in tx) {
        try {
        let thisPodcast = await readContract(arweave, tx[i])
        console.log(thisPodcast)
        podcastList.push(thisPodcast.podcasts)
        } catch {
          console.log('podcast does not exist, or is just not mined yet')
        }
      }
      console.log(podcastList)

      let podcasts = podcastList.filter(
        obj => !(obj && Object.keys(obj).length === 0)
      )

      return podcasts
    }
  

    getPodcast = async (p) => {
      let podcasts = p.filter(
        obj => !(obj && Object.keys(obj).length === 0)
      )
        let id = this.props.match.params.podcastId;
        let podcast = this.findPodcastById(podcasts, id)
        console.log(podcast)
        return podcast
    }

    findPodcastById = (podcastsList, id) => {
      let match

      let pList = podcastsList.filter(
        obj => !(obj && Object.keys(obj).length === 0)
      )

      let podcasts = pList
        console.log(podcasts)

      for (let podcast of podcasts) {
        let p = podcast.flat()
        console.log(p)
          for (let j in p) {
            console.log(p[j])
            if (p[j].pid === id) {
              match = p[j]
            }
          }
          return match
      }

     // let p = podcasts.find(podcastId => Object.values(podcasts).pid === podcastId)
     // console.log(p)
      /*
      let p = podcasts.podcasts
      for (var i=0, iLen=p.length; i<iLen; i++) {
        if (p[i].id === id)
        console.log(p[i])
          return p[i];
        }
        */
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
/*
    loadPodcasts = async (id) => {
      const swcId = id
      let res = await readContract(arweave, swcId)
      return res
    }  
*/

    async componentDidMount() {
      this.setState({loading: true})
      let ids = await this.fetchAllSwcIds()
      let p = await this.loadPodcasts(ids)
      this.setState({podcast: p})
      this.setState({thePodcast: await this.getPodcast(p)})
      console.log(this.state)
      let podcastHtml = this.loadPodcast(this.state.thePodcast)
      
      this.setState({podcastHtml: podcastHtml})
      let podcastEpisodes = this.loadEpisodes(this.state.thePodcast.episodes)
      this.setState({podcastEpisodes: podcastEpisodes})
      this.setState({loading: false})

    }

    render() {
        return(
          <div>
            {this.state.thePodcast.owner === sessionStorage.getItem('wallet_address') ? <Button variant="link" onClick={() => this.showEpisodeForm()}>add new episode</Button> : null }
            {this.state.showEpisodeForm ? <UploadEpisode podcast={this.state.thePodcast}/> : null }
            {this.state.loading && <h5 className="p-5">Loading podcast...</h5>}
            {this.state.podcastHtml}
            {this.state.podcastEpisodes}
          </div>
        )
    }

}

export default Podcast