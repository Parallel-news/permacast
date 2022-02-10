import { React, Component } from 'react'
import PodcastHtml from './podcast_html.jsx'
import { MESON_ENDPOINT } from '../utils/arweave.js'

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

  renderPodcasts = async (podcasts) => {
    let html = []

    for (let podcast of podcasts) {
      // console.log(podcast)
      let p = podcast
      if (p && p.pid !== 'aMixVLXScjjNUUcXBzHQsUPmMIqE3gxDxNAXdeCLAmQ') {
        html.push(
          <div>
            <PodcastHtml
              loadPodcastHeight={this.loadPodcastHeight}
              name={p.podcastName}
              episodes={p.episodes.length}
              link={p.pid}
              description={p.description}
              image={`${MESON_ENDPOINT}/${p.cover}`}
              key={p.pid}
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
    this.setState({ loading: true })
    this.setState({ noPodcasts: false })
    let pArrays = await this.loadPodcasts()
    let p = pArrays.flat()
    this.setState({ podcasts: p })
    let podcasts = await this.renderPodcasts(this.state.podcasts)
    this.setState({ podcastHtml: podcasts })
    if (this.state.podcastHtml.length < 1) {
      this.setState({ noPodcasts: true })
    }
    this.setState({ loading: false })
  }

  async componentDidUpdate(prevProps, prevState) {
    // if for the last change of state, we get the final list of
    // podcastsHeights, rerender with max height for podcast, not auto height
    if (prevState.podcastsHeights.length + 1 === prevState.podcasts.length) {
      let podcasts = await this.renderPodcasts(this.state.podcasts)
      this.setState({
        podcastHtml: podcasts,
        isHeightsLoaded: true,
      })
    }
  }

  render() {
    const podcasts = this.state.podcastHtml
    return (
      <>
        <div className="flex items-center justify-center p-2 md:p-6 font-mono text-md">
          {this.state.noPodcasts ? <h5>No podcasts here yet. Upload one!</h5> : null}
          {this.state.loading ? <h5 className="p-6">Loading podcasts...</h5> : null}
        </div>
        <div>
          {/*
            hide container if load with podcasts of auto height
            show container if load with podcasts of max height
          */}
          <div
            className='grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-3 xl:gap-x-36'
            style={{ visibility: this.state.isHeightsLoaded ? 'visible' : 'hidden' }}>
            {podcasts}
          </div>
        </div>
      </>
    )
  }

}

export default Index
