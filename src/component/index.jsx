import { React, Component } from 'react'
import { CardDeck, Container } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import { MESON_ENDPOINT } from '../utils/arweave.js'
import '../App.css'
/* make arbitrary change */
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            test: true,
            podcasts: {},
            // stores height passed by each podcast child
            podcastsHeights: [],
            // if loaded, change container visibility to true
            isHeightsLoaded: false
        }
    }

  // load height passed by each podcast child
  loadPodcastHeight = (currentPodcastHeight) => {
    this.setState({
      podcastsHeights: [...this.state.podcastsHeights, currentPodcastHeight]
    })
    // console.log(this.state.podcastsHeights)
  }

  fetchAllSwcIds = async () => {
    const response = await fetch("https://permacast-cache.herokuapp.com/feeds/podcasts", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', }
    });

    return (await response.json());
  }

  loadPodcasts = async () => {
    let creatorsContracts = await this.fetchAllSwcIds()
    const podcastList = creatorsContracts.res

    return podcastList;
  }

  // First, render podcasts with auto height and hidden visibility.
  // Then, calculate the max height.
  // Then, render podcasts with max height and change visibility to visible.
  renderPodcasts = async (podcasts, height = 'auto') => {
    let html = []

    for (let podcast of podcasts) {
      // console.log(podcast)
      let p = podcast
      if (p && p.pid !== 'aMixVLXScjjNUUcXBzHQsUPmMIqE3gxDxNAXdeCLAmQ') {
        html.push(
          <div style={{height: height}} className="podcast-card">
            <PodcastHtml
              loadPodcastHeight={this.loadPodcastHeight}
              name={p.podcastName}
              episodes={p.episodes.length}
              link={p.pid}
              description={p.description}
              image={`${MESON_ENDPOINT}/${p.cover}`}
              key={p.pid}
              style={{height: '100%'}}
            />
          </div>
          )
        }
      }
      // push empty card to fill last row
      html.push(
        <div className='podcast-card'></div>
      )
      html.push(
        <div className='podcast-card'></div>
      )
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

    async componentDidUpdate(prevProps, prevState) {
      // if for the last change of state, we get the final list of
      // podcastsHeights, rerender with max height for podcast, not auto height
      if (prevState.podcastsHeights.length + 1 === prevState.podcasts.length) {
        let podcasts = await this.renderPodcasts(this.state.podcasts, Math.max(...this.state.podcastsHeights))
        this.setState({
          podcastHtml: podcasts,
          isHeightsLoaded: true,
        })
      }
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
          {/*
            hide container if load with podcasts of auto height
            show container if load with podcasts of max height
          */}
          <CardDeck style={{ visibility: this.state.isHeightsLoaded ? 'visible' : 'hidden' }}>
            {podcasts}
          </CardDeck>
          </div>
          </>
        )
    }

}

export default Index
