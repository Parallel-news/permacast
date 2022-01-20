import { React, Component } from 'react'
import { CardColumns, Container } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import { readContract } from 'smartweave'
import { queryObject, arweave, MESON_ENDPOINT } from '../utils/arweave.js'

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            podcasts: {}
        }
    }

  fetchAllSwcIds = async () => {
    const response = await fetch("https://permacast-cache.herokuapp.com/feeds/podcasts", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', }
    });

    return (await response.json());
  }

  loadPodcasts = async () => {
    // let podcastList = []
    let creatorsContracts = await this.fetchAllSwcIds()
    const podcastList = creatorsContracts.res

    return podcastList;
  }
  renderPodcasts = async (podcasts) => {
        let html = []

        for (let podcast of podcasts) {
          console.log(podcast)
          let p = podcast
          if (p && p.pid !== 'aMixVLXScjjNUUcXBzHQsUPmMIqE3gxDxNAXdeCLAmQ') {
            html.push(
              <>
                <PodcastHtml
                  name={p.podcastName}
                  episodes={p.episodes.length}
                  link={p.pid}
                  description={p.description}
                  image={`${MESON_ENDPOINT}/${p.cover}`}
                  key={p.pid}
                />
              </>
            ) 
          }
        }
        return html
    }

    async componentDidMount() {
      this.setState({loading: true})
      this.setState({noPodcasts: false})
      let pArrays = await this.loadPodcasts()  
      let p = pArrays.flat()
      this.setState({podcasts: p}) 
      let podcasts = await this.renderPodcasts(this.state.podcasts)
      this.setState({podcastHtml: podcasts}) 
      if ( this.state.podcastHtml.length < 1 ) {
        this.setState({noPodcasts: true})
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
