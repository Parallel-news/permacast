import { React, Component } from 'react'
import { CardColumns } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import { readContract } from 'smartweave'
import Arweave from 'arweave'

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});

let podcasts

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            podcasts: {}
        }
    }

  loadPodcasts = async () => {
    const swcId = 'mvBG00Ccigq9htgOVCdAe9vXM8efbGzm8ax89NIlZS8'
    let res = await readContract(arweave, swcId)
    console.log(res)
    return res
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
    


    podcasts = async () => {
      console.log(this.state.podcasts)
        let podcast = this.linkValues(this.state.podcasts)
        console.log(podcast)
        const podcasts = []
        for (let i in podcast) {
          let p = podcast[i];
          podcasts.push(
            <>
            <PodcastHtml
            name={p.podcastName}
            link={p.pid}
            description={p.description}
            image={`https://arweave.net/${p.cover}`}
            media={p.media}
            />
            </>
          )
        }
        return podcasts
    }

    async componentDidMount() {
      let p = await this.loadPodcasts()
      this.setState({podcasts: p})
      podcasts = await this.podcasts(this.state.p)
      this.setState({podcastHtml: podcasts})
    }

    render() {
        return( 
          <>
          <CardColumns>
            {this.state.podcastHtml}
          </CardColumns>
          </>
        )
    }

}

export default Index