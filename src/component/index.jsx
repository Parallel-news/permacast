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


const queryObject = {
  query: 
    `query {
transactions(
tags: [

    { name: "Contract-Src", values: "-8KJxT3RguaST3dtqdjANFWykPAPtER6uZE_LBDpOb8"},
    { name: "Action", values: "launchCreator"},
    { name: "Protocol", values: "permacast-testnet-v0"}
  
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

let podcasts

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
    const data_arr = [];

    const res_arr = json["data"]["transactions"]["edges"];

    for (let element in Object.values(res_arr)) {
      data_arr.push(res_arr[element]["node"]["id"])
    }
    return data_arr
  }

  loadPodcasts = async () => {
    let tx
    let podcastList = []
    let swcIds = await this.fetchAllSwcIds()
    tx = await this.getStates(swcIds)
    console.log(tx)
    for (let i in tx) {
      console.log('about to break:')
      console.log(tx[i])
      let thisPodcast = await readContract(arweave, tx[i].pid)
      console.log(thisPodcast)
      podcastList.push(thisPodcast.podcasts)
    }
    console.log(podcastList)
    return podcastList
  }

    linkValues = (podcast) => {
      let p = podcast
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
   
    
    getStates = async (ids) => {
      const data = []
      for (let swc of ids) {
        const tx = await readContract(arweave, swc) 
        const txObj = (Object.values(tx)[0])
        const state = Object.values(txObj)
        state[0]["pid"] = swc
    
        data.push(state[0])
      }
      return data
    }

    podcasts = async () => {
        let podcast = this.state.podcasts.filter(
          obj => !(obj && Object.keys(obj).length === 0)
        )

        console.log(podcast)

        //this.linkValues(this.state.podcasts)
        const podcasts = []
        const ids = Object.values(podcast['0'])
        for (let i in ids) {
          let p = Object.values(podcast[i]);
          console.log(p)
          for (let i in p) {
            console.log(p[i].podcastName)
          podcasts.push(
            <>
            <PodcastHtml
            name={p[i].podcastName}
            //link={p[i].pid}
            //description={p[i].description}
            //image={`https://arweave.net/${p[i].cover}`}
            />
            </>
          ) 
          }
        }
        return podcasts
    }

    async componentDidMount() {
      this.setState({loading: true})
      this.setState({noPodcasts: false})
      let p = await this.loadPodcasts()
      this.setState({podcasts: p})
      podcasts = await this.podcasts(this.state.p)
      this.setState({podcastHtml: podcasts})
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