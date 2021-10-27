import { React, Component } from 'react'
import { Container, Button, Row, Col } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import UploadEpisode from './upload_episode.jsx'
import { readContract } from 'smartweave'
import 'shikwasa/dist/shikwasa.min.css'
import swal from 'sweetalert'
import Shikwasa from 'shikwasa'
import { FaPlay } from 'react-icons/fa';
import { arweave, queryObject } from '../utils/arweave.js'

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

  loadPodcasts = async () => {
    let podcastList = []
    let creatorsContracts = await this.fetchAllSwcIds()

    for (let contract of creatorsContracts) {

      try {
        let thisPodcast = await readContract(arweave, contract)
        for (let podcastObject of thisPodcast.podcasts) {
          podcastList.push(podcastObject)
        }
      } catch {
        console.log('podcast does not exist, or is just not mined yet')
      }
    }
    console.log(podcastList)
    return podcastList
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
      <div>
        <PodcastHtml
          rss={`${p.childOf}/${p.pid}`}
          owner={p.owner}
          id={p.pid}
          link={p.pid}
          name={p.podcastName}
          titleClass={'h2'}
          description={p.description}
          image={`https://arweave.net/${p.cover}`}
        />
      </div>
    )
    return podcastHtml
  }

  loadEpisodes = (p) => {
    let ep = p
    const episodeList = []
    for (let i in ep) {
      let e = ep[i]
      console.log(e)
      if (e.eid !== 'FqPtfefS8QNGWdPcUcrEZ0SXk_IYiOA52-Fu6hXcesw') {
        episodeList.push(
          <div>
            <Row className="p-1 m-2 align-items-center episode-row">
              <Col md="auto">
                <Button size="lg" variant="link" className="play-button" onClick={() => this.showPlayer(e)}> <FaPlay /> </Button>
              </Col>
              <Col md="auto">
                <div>{e.episodeName}</div>
              </Col>
              <Col>{this.truncatedDesc(e.description, 52)}</Col>
            </Row>
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
      return <>{desc.substring(0, maxLength)}... <Button variant="link" onClick={() => this.showDesc(desc)}>[read more]</Button></>
    }
  }

  showDesc = (desc) => {
    swal({
      text: desc,
      button: 'close'
    })
  }

  showPlayer = (e) => {
    let name = this.state.thePodcast.podcastName
    let cover = this.state.thePodcast.cover
    const player = new Shikwasa({
      container: () => document.querySelector('.podcast-player'),
      themeColor: 'black',
      autoplay: true,
      audio: {
        title: e.episodeName,
        artist: name,
        cover: `https://arweave.net/${cover}`,
        src: `https://arweave.net/${e.audioTx}`,
      },
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
    let podcastEpisodes = this.loadEpisodes(this.state.thePodcast.episodes)
    this.setState({ podcastEpisodes: podcastEpisodes })
    this.setState({ loading: false })
    let addr = await window.arweaveWallet.getActiveAddress()
    this.setState({ addr: addr })
    console.log(this.state.thePodcast)
  }

  render = () => {
    return (
      <div>
        {this.state.showEpisodeForm ? <UploadEpisode podcast={this.state.thePodcast} /> : null}
        {this.state.loading && <h5 className="p-5">Loading podcast...</h5>}
        {this.state.podcastHtml}
        <Container className="episodes-container">{this.state.podcastEpisodes}</Container>
        {!this.state.loading && this.state.thePodcast.owner === this.state.addr && <Button size="" variant="link" onClick={() => this.showEpisodeForm()}>add new episode</Button>}
        <div className="podcast-player position-sticky fixed-bottom" />
      </div>
    )
  }

}


export default Podcast