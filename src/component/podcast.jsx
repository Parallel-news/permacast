import { useEffect, useState } from 'react'
import PodcastHtml from './podcast_html.jsx'
import UploadEpisode from './upload_episode.jsx'
import * as SmartWeaveSdk from 'redstone-smartweave';
import 'shikwasa/dist/shikwasa.min.css'
import Swal from 'sweetalert2'
import Shikwasa from 'shikwasa'
import { MESON_ENDPOINT } from '../utils/arweave.js'
import { isDarkMode } from '../utils/theme.js'
import fetchPodcasts from '../utils/podcast.js';
import { useTranslation } from 'react-i18next';

export default function Podcast(props) {
  const [loading, setLoading] = useState(true)
  const [showEpisodeForm, setShowEpisodeForm] = useState(false)
  const [addr, setAddr] = useState('')
  const [thePodcast, setThePodcast] = useState(null)
  const [podcastHtml, setPodcastHtml] = useState(null)
  const [podcastEpisodes, setPodcastEpisodes] = useState([])
  const { t } = useTranslation()

  const getPodcastEpisodes = async () => {
    const pid = props.match.params.podcastId;

    const response = await fetch(`https://whispering-retreat-94540.herokuapp.com/feeds/episodes/${pid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', }
    });

    const episodes = (await response.json())["episodes"];
    return episodes;
  }

  const getPodcast = (p) => {
    let podcasts = p.filter(
      obj => !(obj && Object.keys(obj).length === 0)
    )
    let id = props.match.params.podcastId;
    let podcast = _findPodcastById(podcasts, id)
    return podcast
  }

  const _findPodcastById = (podcastsList, id) => {
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

  // const linkValues = (podcast) => {
  //   let p = podcast.podcasts
  //   const keys = Object.keys(p)
  //   const values = Object.values(p)
  //   const resultArr = []

  //   for (let i = 0; i < keys.length; i++) {
  //     const currentValues = values[i]
  //     const currentKey = keys[i]
  //     currentValues["pid"] = currentKey
  //     resultArr.push(currentValues)

  //   }
  //   return resultArr
  // }

  const loadPodcastHtml = (p) => {
    return <PodcastHtml
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
  }

  const tryAddressConnecting = async () => {
    let addr;
    try {
      addr = await window.arweaveWallet.getActiveAddress();
      return addr;
    } catch (error) {
      console.log("🦔Displaying feed for non-ArConnect installed users🦔");
      //  address retrived from the top list of https://viewblock.io/arweave/addresses
      addr = "dRFuVE-s6-TgmykU4Zqn246AR2PIsf3HhBhZ0t5-WXE";
      return addr;
    }
  };

  const loadEpisodes = async (podcast, episodes) => {
    console.log(podcast)
    const episodeList = []
    const addr = await tryAddressConnecting();
    for (let i in episodes) {
      let e = episodes[i]
      console.log("episode", e)
      if (e.eid !== 'FqPtfefS8QNGWdPcUcrEZ0SXk_IYiOA52-Fu6hXcesw') {
        episodeList.push(
          <div
            className="flex flex-col md:flex-row justify-between items-center shadow-lg rounded-xl hover:border px-10 py-5 md:py-2 my-4 md:h-24 mx-3 md:mx-auto"
            key={e.eid}
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-x-10 mr-5">
              <div className="flex space-x-10 mb-3 md:mb-0">
                <button onClick={() => showPlayer(podcast, e)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <a
                  href={`${MESON_ENDPOINT}/${e.contentTx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
              <div className="font-bold w-full md:w-auto text-center">{e.episodeName}</div>
            </div>
            <div className='text-sm w-full md:w-auto text-center'>
              {truncatedDesc(e.description, 52)}
            </div>
          </div >
        )

      }
    }
    return episodeList
  }

  const checkEpisodeForm = async (podObj) => {
    let addr = await window.arweaveWallet.getActiveAddress();
    if (addr === podObj.owner || podObj.superAdmins.includes(addr)) {
      setShowEpisodeForm(true)
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
  const truncatedDesc = (desc, maxLength) => {
    if (desc.length < maxLength) {
      return <>{desc}</>
    } else {
      return <>{desc.substring(0, maxLength)}... <span className="text-blue-500 hover:cursor-pointer" onClick={() => showDesc(desc)}>[read more]</span></>
    }
  }

  const showDesc = (desc) => {
    Swal.fire({
      text: desc,
      button: 'close',
      customClass: "font-mono",
    })
  }

  const showPlayer = (podcast, e) => {
    const player = new Shikwasa({
      container: () => document.querySelector('.podcast-player'),
      themeColor: 'gray',
      theme: `${isDarkMode() ? 'dark' : 'light'}`,
      autoplay: true,
      audio: {
        title: e.episodeName,
        artist: podcast.podcastName,
        cover: `${MESON_ENDPOINT}/${podcast.cover}`,
        src: `${MESON_ENDPOINT}/${e.contentTx}`,
      },
      download: true
    })
    player.play()
    window.scrollTo(0, document.body.scrollHeight)
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const p = getPodcast(await fetchPodcasts())
      console.log(p)
      const ep = await getPodcastEpisodes()
      setThePodcast(p)
      setPodcastHtml(loadPodcastHtml(p))
      setPodcastEpisodes(await loadEpisodes(p, ep))
      setAddr(await tryAddressConnecting())

      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center">
      {showEpisodeForm ? <UploadEpisode podcast={thePodcast} /> : null}
      {loading && <h5 className="p-5">{t("loading")}</h5>}
      <div className="block w-full md:w-2/3 h-auto">
        {podcastHtml}
      </div>
      <div>{podcastEpisodes}</div>
      {!loading && (thePodcast.owner === addr || thePodcast.superAdmins.includes(addr)) && <button className='btn' onClick={() => checkEpisodeForm(thePodcast)}>{t("add new episode")}</button>}
      < div className="podcast-player sticky bottom-0 w-screen" />
    </div>

  )
}
