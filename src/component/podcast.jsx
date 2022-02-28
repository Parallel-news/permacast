import { React, Component } from 'react'
import PodcastHtml from './podcast_html.jsx'
import UploadEpisode from './upload_episode.jsx'
import * as SmartWeaveSdk from 'redstone-smartweave';
import 'shikwasa/dist/shikwasa.min.css'
import Swal from 'sweetalert2'
import Shikwasa from 'shikwasa'
import { arweave, queryObject, MESON_ENDPOINT } from '../utils/arweave.js'

class Podcast extends Component {

  constructor(props) {
    super(props);
    this.state = {
      test: true,
      thePodcast: {} // await this.getPodcast()
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

  getPodcastEpisodes = async () => {
    const pid = this.props.match.params.podcastId;

    const response = await fetch(`https://permacast-cache.herokuapp.com/feeds/episodes/${pid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', }
    });

    const episodes = (await response.json())["episodes"];
    return episodes;
  }

  getPodcast = async (p) => {
    let podcasts = p.filter(
      obj => !(obj && Object.keys(obj).length === 0)
    )
    let id = this.props.match.params.podcastId;
    let podcast = this._findPodcastById(podcasts, id)
    console.log(podcast)
    return podcast
  }

  _findPodcastById = (podcastsList, id) => {

    let pList = podcastsList.filter(
      obj => !(obj && Object.keys(obj).length === 0)
    )

    const match = pList.find(podcast => podcast.pid === id)
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

  linkValues = (podcast) => {
    let p = podcast.podcasts
    const keys = Object.keys(p)
    const values = Object.values(p)
    const resultArr = []

    for (let i = 0; i < keys.length; i++) {
      const currentValues = values[i]
      const currentKey = keys[i]
      currentValues["pid"] = currentKey
      resultArr.push(currentValues)

    }
    return resultArr
  }

  loadPodcast = () => {
    const p = this.state.thePodcast
    const podcastHtml = []
    podcastHtml.push(
      <PodcastHtml
        rss={`rss/${p.pid}`}
        owner={p.owner}
        id={p.pid}
        link={p.pid}
        name={p.podcastName}
        titleClass={'h2'}
        description={p.description}
        image={`${MESON_ENDPOINT}/${p.cover}`}
        key={p.pid}
        smallImage={true}
      />
    )
    return podcastHtml
  }
  tryAddressConnecting = async () => {
    let addr;
    try {
      addr = await window.arweaveWallet.getActiveAddress();
      return addr;
    } catch (error) {
      console.log("🦔Displaying feed for non-ArConnect installed users🦔");
      addr = "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0";
      return addr;
    }
  };
  loadEpisodes = async (p) => {
    let ep = p
    const episodeList = []
    const addr = await this.tryAddressConnecting();
    for (let i in ep) {
      let e = ep[i]
      console.log(e)
      if (e.eid !== 'FqPtfefS8QNGWdPcUcrEZ0SXk_IYiOA52-Fu6hXcesw') {
        episodeList.push(
          <div
            className="flex flex-col md:flex-row justify-between items-center shadow-lg rounded-xl hover:border px-10 py-5 md:py-2 my-4 md:h-24 mx-3 md:mx-auto"
            key={e.eid}
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-x-10 mr-5">
              <div className="flex space-x-10 mb-3 md:mb-0">
                <button onClick={() => this.showPlayer(e)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button onClick={() => window.open(`{${MESON_ENDPOINT}/${e.eid}`, "_blank")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              <div className="font-bold w-full md:w-auto text-center">{e.episodeName}</div>
            </div>
            <div className='text-sm w-full md:w-auto text-center'>
              {this.truncatedDesc(e.description, 52)}
            </div>
          </div>
        )

      }
    }
    return episodeList
  }

  showEpisodeForm = async () => {
    let addr = await window.arweaveWallet.getActiveAddress()
    if (addr === this.state.thePodcast.owner) {
      this.setState({ showEpisodeForm: true })
      window.scrollTo(0, 0)
    } else {
      alert('Not the owner of this podcast')
    }
  }
  /*
      loadPodcasts = async (id) => {
        const swcId = id
        let res = await readContract(arweave, swcId)
        return res
      }  
  */
  truncatedDesc = (desc, maxLength) => {
    if (desc.length < maxLength) {
      return <>{desc}</>
    } else {
      return <>{desc.substring(0, maxLength)}... <span className="text-blue-500 hover:cursor-pointer" onClick={() => this.showDesc(desc)}>[read more]</span></>
    }
  }

  showDesc = (desc) => {
    Swal.fire({
      text: desc,
      button: 'close',
      customClass: "font-mono",
    })
  }

  showPlayer = (e) => {
    let name = this.state.thePodcast.podcastName
    let cover = this.state.thePodcast.cover
    const player = new Shikwasa({
      container: () => document.querySelector('.podcast-player'),
      themeColor: 'gray',
      autoplay: true,
      audio: {
        title: e.episodeName,
        artist: name,
        cover: `${MESON_ENDPOINT}/${cover}`,
        src: `https://arweave.net/${e.audioTx}`,
      },
      download: true
    })
    window.scrollTo(0, document.body.scrollHeight)
  }

  componentDidMount = async () => {
    this.setState({ loading: true })
    let ids = await this.fetchAllSwcIds()
    let p = await this.loadPodcasts(ids)
    this.setState({ podcast: p })
    this.setState({ thePodcast: await this.getPodcast(p) })
    console.log(this.state)
    let podcastHtml = this.loadPodcast(this.state.thePodcast)
    this.setState({ podcastHtml: podcastHtml })
    const eps = await this.getPodcastEpisodes()
    let podcastEpisodes = await this.loadEpisodes(eps)
    this.setState({ podcastEpisodes: podcastEpisodes })
    this.setState({ loading: false })
    const addr = await this.tryAddressConnecting();
    console.log(addr)
    this.setState({ addr: addr })
    console.log(this.state.thePodcast)
  }

  render = () => {
    return (
      <div className="flex flex-col items-center justify-center">
        {this.state.showEpisodeForm ? <UploadEpisode podcast={this.state.thePodcast} /> : null}
        {this.state.loading && <h5 className="p-5">Loading podcast...</h5>}
        <div className="block w-full md:w-2/3 h-auto">
          {this.state.podcastHtml}
        </div>
        <div>{this.state.podcastEpisodes}</div>
        {!this.state.loading && this.state.thePodcast.owner === this.state.addr && <button className='btn' onClick={() => this.showEpisodeForm()}>add new episode</button>}
        <div className="podcast-player sticky bottom-0 w-screen" />
      </div>

    )
  }

}


export default Podcast
