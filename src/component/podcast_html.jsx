import { React, } from 'react';
import { FaRss, FaRegGem } from 'react-icons/fa';
import { contract } from 'redstone-smartweave';
import { arweave, smartweave, NEWS_CONTRACT } from '../utils/arweave.js'
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function PodcastHtml({ name, link, description, image, rss, smallImage = false }) {
    const { t } = useTranslation()
    const loadRss = () => {
        console.log(rss)
        window.open(`https://permacast-cache.herokuapp.com/feeds/${rss}`, '_blank')
    }
    const tipButton = () => {
        return <button className="btn btn-sm btn-outline" onClick={() => tipPrompt()}><FaRegGem className='mr-2' /> Tip</button>
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

    const tipPrompt = async () => {
        Swal.fire({
            title: t("podcasthtml.swal.title"),
            text: t("podcasthtml.swal.text"),
            customClass: "font-mono",
        })
        return false

        // const addr = await window.arweaveWallet.getActiveAddress();

        // const podcastId = id;
        // const name = name;
        // const recipient = props.owner;
        // const { value: tipAmount } = await Swal.fire({
        //     title: `Tip ${name} 🙏`,
        //     input: 'text',
        //     inputPlaceholder: 'Amount to tip ($NEWS)',
        //     confirmButtonText: 'Tip'
        // });

        // if (tipAmount && checkNewsBalance(addr, tipAmount)) {

        //     let n = parseInt(tipAmount);
        //     if (Number.isInteger(n) && n > 0) {

        //         if (transferNews(recipient, tipAmount)) {

        //             Swal.fire({
        //                 title: 'You just supported a great podcast 😻',
        //                 text: `${name} just got ${tipAmount} $NEWS.`
        //             })

        //         } else {
        //             Swal.fire({
        //                 title: 'Enter a whole number of $NEWS to tip.'
        //             })
        //         }
        //     }
        // }
    }

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
            <div className="card-body items-center text-center pt-3 pb-1 text-sm">
                <div className="card-title text-sm md:text-lg">
                    {name} {rss ? <span><button className="btn btn-sm bg-yellow-400 border-none" onClick={() => loadRss()}><FaRss /></button> {tipButton()} </span> : null}
                </div>
                <p className="mb-2">
                    <span className={!smallImage && "line-clamp-3"}>{description}</span>
                </p>
            </div>
        </div >
    )

}
