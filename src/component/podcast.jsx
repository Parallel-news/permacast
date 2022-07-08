import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaRss, FaRegGem } from 'react-icons/fa';
import { PlusIcon, HeartIcon } from '@heroicons/react/solid';
import Swal from 'sweetalert2';
import Shikwasa from 'shikwasa';
import 'shikwasa/dist/shikwasa.min.css';
import { TrackView } from './trackView.jsx';
import { tipPrompt } from './tipPrompt.jsx';
import UploadEpisode from './uploadEpisode.jsx';
import * as SmartWeaveSdk from 'redstone-smartweave';
import { contract } from 'redstone-smartweave';
import { arweave, smartweave, NEWS_CONTRACT, MESON_ENDPOINT } from '../utils/arweave.js';
import { convertToPodcast, convertToEpisode, fetchPodcasts } from '../utils/podcast.js';
import { getButtonRGBs } from '../utils/ui.js';
import { appContext } from '../utils/initStateGen.js';
import { isDarkMode } from '../utils/theme.js';

export function PodcastHtml({ name, link, description, image, rss, smallImage = false, truncated = false }) {
    const { t } = useTranslation()
    const loadRss = () => {
        // console.log(rss)
        window.open(`https://whispering-retreat-94540.herokuapp.com/feeds/${rss}`, '_blank')
    }
    const tipButton = () => {
        return <button className="btn btn-sm btn-outline" onClick={() => tipPrompt(t)}><FaRegGem className='mr-2' /> Tip</button>
    }

    // const checkNewsBalance = async (addr, tipAmount) => {
    //     const contract = contract(NEWS_CONTRACT)
    //     const state = await contract.readState();
    //     if (state.balances.hasOwnProperty(addr) && state.balances.addr >= tipAmount) {
    //         return true
    //     } else {
    //         return false
    //     }
    // }

    // const transferNews = async (recipient, tipAmount) => {
    //     const input = { "function": "transfer", "target": recipient, "qty": parseInt(tipAmount) };
    //     const contract = contract(NEWS_CONTRACT);
    //     const tx = await contract.writeInteraction(arweave, "use_wallet", NEWS_CONTRACT, input);
    //     console.log(tx);
    // }


    // const episodeCount = (count) => {
    //     if (count == 1) {
    //         return `${count} episode`
    //     } else {
    //         return `${count} episodes`
    //     }
    // }

    return (
        <div className={`card text-center h-full ${!smallImage && "shadow-2xl hover:cursor-pointer hover:border"}`}>
            <div className={`px-2 pt-3 md:px-5 md:pt-5 w-full h-auto mx-auto ${smallImage && "md:w-2/5"}`}>
                <a href={`/#/podcasts/${link} `}>
                    <figure className="aspect-h-1 aspect-w-1">
                        <img className="object-cover pointer-events-none group-hover:opacity-75 rounded-xl" alt={`${name} cover`} src={image} />
                    </figure>
                </a>
            </div>
            <div className='card-body items-center text-center pt-3 pb-1'>
                <div className="card-title text-sm md:text-lg">
                    {name} {rss ? <span><button className="btn btn-sm bg-yellow-400 border-none" onClick={() => loadRss()}><FaRss /></button> {tipButton()} </span> : null}
                </div>
                <p className="text-sm mb-2">
                    {truncated && description.length > 52 ? description.substring(0, 52) + '...' : description}
                </p>
            </div>
        </div >
    )
}

export function Podcast(props) {
  const { t } = useTranslation()
  const appState = useContext(appContext);
  const {address, setAddress} = appState.user;
  const [loading, setLoading] = useState(true);

  const [thePodcast, setThePodcast] = useState(null);
  const [podcastHtml, setPodcastHtml] = useState(null);
  const [podcastEpisodes, setPodcastEpisodes] = useState([]);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const {setCurrentPodcastColor, currentPodcastColor} = appState.theme;

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
  const loadRss = () => {
    // console.log(rss)
    window.open(`https://whispering-retreat-94540.herokuapp.com/feeds/rss/${thePodcast.podcastId}`, '_blank')
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
      rss={`rss/${p.podcastId}`}
      owner={p.creatorAddress}
      id={p.podcastId}
      link={p.podcastId}
      name={p.title}
      titleClass={'h2'}
      description={p.description}
      image={`${MESON_ENDPOINT}/${p.cover}`}
      key={p.pid}
      smallImage={true}
    />
  }

  // const tryAddressConnecting = async () => {
  //   let addr;
  //   try {
  //     addr = await window.arweaveWallet.getActiveAddress();
  //     return addr;
  //   } catch (error) {
  //     console.log("🦔Displaying feed for non-ArConnect installed users🦔");
  //     //  address retrived from the top list of https://viewblock.io/arweave/addresses
  //     addr = "dRFuVE-s6-TgmykU4Zqn246AR2PIsf3HhBhZ0t5-WXE";
  //     return addr;
  //   }
  // };

  const loadEpisodes = async (podcast, episodes) => {
    console.log(podcast)
    const episodeList = []
    for (let i in episodes) {
      let e = episodes[i]
      // console.log("episode", e)
      if (e.eid !== 'FqPtfefS8QNGWdPcUcrEZ0SXk_IYiOA52-Fu6hXcesw') {
        episodeList.push(
          <div
            className="flex flex-col md:flex-row justify-between items-center shadow-lg rounded-xl border border-zinc-800 hover:border-white px-10 py-5 md:py-2 my-4 md:h-24 mx-3 md:mx-auto"
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
    if (address === podObj.creatorAddress || podObj.superAdmins.includes(address)) {
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
      // console.log(p)
      const ep = await getPodcastEpisodes()
      const convertedPodcast = await convertToPodcast(p)
      const convertedEpisodes = await Promise.all(ep.map(e => convertToEpisode(convertedPodcast, e, false)))
      setThePodcast(convertedPodcast)
      setCurrentPodcastColor(convertedPodcast?.rgb)
      // setPodcastHtml(loadPodcastHtml(p))
      setPodcastEpisodes(convertedEpisodes)
      // setAddr(await tryAddressConnecting())
      setLoading(false)
    }
    fetchData()
  }, [])

  const isOwner = (thePodcast?.creatorAddress === address || thePodcast?.superAdmins?.includes(address))
  return (
    <div className="flex flex-col items-center justify-center mb-20">
      {!loading && (
        <div className="p-14 flex items-center w-full">
          <img className="w-40 cursor-pointer  mr-8" src={thePodcast.cover} alt={thePodcast.title} />
          <div className="col-span-2 my-3 text-zinc-100 w-3/6 mr-2">
            <div className="text-lg font-medium tracking-wide select-text line-clamp-1">{thePodcast?.title}</div>
            <div className="line-clamp-5 select-text">{thePodcast?.description}</div>
          </div>
          <div className="ml-auto">
            <div className="flex items-center justify-between">
              <button className="btn btn-primary btn-sm normal-case rounded-xl border-0" style={getButtonRGBs(currentPodcastColor)} onClick={() => loadRss()}>
                <FaRss className="mr-2 w-3 h-3" /><span className="font-normal">RSS</span>
              </button>
              {!isOwner && (
                <div className="tooltip" data-tip="Coming soon!">
                  <button disabled className="btn btn-outline btn-sm normal-case rounded-xl border-0 ml-4" style={getButtonRGBs(currentPodcastColor)} onClick={() => tipPrompt(t)}>
                    <HeartIcon className="mr-2 w-4 h-4" /><span className="font-normal">Tip</span>
                  </button>
                </div>
              )}
              {thePodcast && isOwner && (
                <button className="btn btn-outline btn-sm normal-case rounded-xl border-0 ml-4" style={getButtonRGBs(currentPodcastColor)} onClick={() => checkEpisodeForm(thePodcast)}>
                  <PlusIcon className="mr-2 w-4 h-4" /><span className="font-normal">{t("podcast.newepisode")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showEpisodeForm ? <UploadEpisode podcast={thePodcast} /> : null}
      {loading && <h5 className="p-5">{t("loadingEpisodes")}</h5>}
      <div className="w-full">
        {podcastEpisodes && podcastEpisodes.map((e, i) => (
          <div key={i} className="mb-6 p-2.5 border rounded-xl border-zinc-600">
            <TrackView episode={e} />
          </div>
        ))}
        {!loading && podcastEpisodes.length === 0 && <h5 className="p-5">{t("podcast.noepisodes")}</h5>}
      </div>
      < div className="podcast-player sticky bottom-0 w-screen" />
    </div>
  )
}



export function PodcastView({podcast}) {
  const appState = useContext(appContext);
  const {title, description} = podcast;

  return (
    <div className="h-full">
      <div className="p-14 flex w-full border border-zinc-800 rounded-[24px]">
        <div className="col-span-2 my-3 text-zinc-100 max-w-xs md:max-w-lg mr-2">
          <div className="font-medium cursor-pointer line-clamp-1"></div>
          <div className="text-sm line-clamp-5"></div>
        </div>
      </div>
      <div>
        {podcast.episodes?.map((e, i) => (
          <div className="mt-4">
            <TrackView episode={e} key={i} />
          </div>
        ))}
      </div>
    </div>
  )
}