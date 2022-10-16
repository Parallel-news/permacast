import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'
// import PodcastHtml from './podcast_html.jsx'
// import { MESON_ENDPOINT } from '../utils/arweave.js'
// import { useTranslation } from 'react-i18next'
// import { fetchPodcasts, sortPodcasts } from '../utils/podcast.js'
// import { Dropdown } from '../component/podcast_utils.jsx'
import ArConnectLoader from './arconnect_loader'
import { isDarkMode } from '../utils/theme'
import { themeChange } from "theme-change";
import { useTranslation } from 'react-i18next'
import { Disclosure } from '@headlessui/react'
import { TranslateIcon } from '@heroicons/react/outline'
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import Swal from 'sweetalert2';

export default withRouter(function Resume(props) {

    const [darkMode, setDarkMode] = useState(isDarkMode())
    const [cover, setCover] = useState("");
    const [dName, setDName] = useState("");
    const [history, setHistory] = useState("");
    const [time, setTime] = useState(0);
    const [visible, setVisible] = useState(false)


    useEffect(() => {
        themeChange(false);
        // 👆 false parameter is required for react project
    }, []);



    // const { t, i18n } = useTranslation();

    // const changeLanguage = (lng) => {
    //     i18n.changeLanguage(lng);
    // };

    //   const [loading, setLoading] = useState(false)
    // const history = useHistory();
    React.useEffect(() => {
        if (typeof window.localStorage.getItem('lastPlayed') === "string" &&
            typeof JSON.parse(window.localStorage.getItem('lastPlayed')) === "object"
        ) {
            const castDetails = JSON.parse(window.localStorage.getItem("lastPlayed"));
            // Swal.fire({
            //     // title: 'Continue where you left off.',
            //     html: castDetails.hasOwnProperty("currentTime") ? `<p class="font-bold w-full md:w-auto text-center">Continue where you left off?</p>
            //         <p class="text-sm w-full md:w-auto text-center mt-10 mb-4">Would you like to resume listening to  <p class="text-sm font-bold">${castDetails.e.episodeName}</p> at <p class="text-sm font-bold">${castDetails.currentTime}</p></p>`:
            //         `<p class="font-bold w-full md:w-auto text-center">Continue where you left off?</p>
            //         <p class="text-sm w-full md:w-auto text-center mt-10 mb-4">Would you like to resume listening to  <p class="text-sm font-bold">${castDetails.e.episodeName}</p></p>`,
            //     showCancelButton: true,
            //     customClass: {
            //         validationMessage: 'font-mono',
            //         cancelButton: 'font-mono',
            //         confirmButton: 'border-prim2 font-mono',
            //     },
            //   }).then((result) => {
            //     if(result.isConfirmed === true){
            //         console.log(castDetails.location.pathname)
            //         props.history.push(castDetails.location.pathname + "?continue=true");
            //     }
            //   })
            if (castDetails.hasOwnProperty("podcast")) {
                setCover(`https://pz-prepnb.meson.network/${castDetails.podcast.cover}`);
                setDName(castDetails.podcastName);
                setHistory(castDetails.location.pathname + "?continue=true")
                if (castDetails.hasOwnProperty("currentTime")) {
                    setTime(castDetails.currentTime)
                }
                setVisible(true);
            }
        }
    }, [])

    return (
        visible ? <div className="bg-white rounded-xl">

            {(props.location.pathname.includes("/podcasts/") === false) ? <div className="card pt-4 bg-white rounded- flex flex-col place-content-center flex-wrap fixed bottom-0 w-28 mb-4" onClick={() => props.history.push(history)}>
                <img className="object-cover pointer-events-none group-hover:opacity-75 mx-2 mb-2 rounded-md h-20 w-20" alt={`${dName} cover`} src={cover} />
                <a className="flex-1 mx-2 w-20 text-black" href="/">
                    <span>{time <= 0 ? "Revisit?" : "Continue?"}</span>
                </a>

            </div> : <></>}
        </div>: <></>
    )
})

