import { React, Component } from 'react'
import { CardColumns, Container } from 'react-bootstrap'
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

// -8KJxT3RguaST3dtqdjANFWykPAPtER6uZE_LBDpOb8
////    { name: "Protocol", values: "permacast-testnet-v0"}

const podcasts = []

const queryObject = {
  query: 
    `query {
transactions(
tags: [
    { name: "Contract-Src", values: "3-mBKpDjBTzmRWiQ8U0rtW5oe6Ky6IQYFh7qDsOd4-0"},
    { name: "Protocol", values: "permacast-testnet-v2"}

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

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            podcasts: {}
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

  loadPodcasts = async () => {
    let podcastList = []
    let tx = await this.fetchAllSwcIds()
    //let tx = [ "qa8uYApESo8Jgx4jQvukfIrhAASNLXLefY6QIFivYpo" ]
    console.log(tx)
    for (let i in tx) {
      console.log('about to break:')
      try {
      let thisPodcast = await readContract(arweave, tx[i])
      
      console.log(thisPodcast)
      podcastList.push(thisPodcast.podcasts)
      } catch {
        console.log('podcast does not exist, or is just not mined yet')
      }
    }
    console.log(podcastList)
    return podcastList
  }

  renderPodcasts = async () => {
        let podcast = this.state.podcasts.filter(
          obj => !(obj && Object.keys(obj).length === 0)
        )

        console.log(podcast)

        for (let i in podcast) {
          console.log(podcast[i])
          let p = podcast[i]
          try {
          podcasts.push(
            <>
            <PodcastHtml
            name={p[i].podcastName}
            link={p[i].pid}
            description={p[i].description}
            image={`https://arweave.net/${p[i].cover}`}
            />
            </>
          ) 
          } catch {
            console.log('blank podcast')
          }
        }
        return podcasts
    }

    async componentDidMount() {
      this.setState({loading: true})
      this.setState({noPodcasts: false})
      let pArrays = await this.loadPodcasts()  
      let p = pArrays.flat()
      this.setState({podcasts: p}) 
      podcasts.push(await this.renderPodcasts(this.state.p))
      console.log(p)
      this.setState({podcastHtml: podcasts}) 
      console.log(this.state)
      if ( this.state.podcastHtml.length < 1 ) {
      //  this.setState({noPodcasts: true})
      }
      this.setState({loading: false})
    }

    render() {
      const podcasts = this.state.podcastHtml
        return( 
          <>
          <Container className="mt-5">
          <div className="">
          {this.state.noPodcasts ? <h5>No podcasts here yet. Upload one!</h5>: null}
          {this.state.loading ? <h5 className="p-6">Loading podcasts...</h5> : null }
          </div>
          </Container>
          <div>
          <CardColumns>
            {podcasts}
          </CardColumns>
          </div>
          </>
        )
    }

}

export default Index