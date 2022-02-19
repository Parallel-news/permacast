import { React, Component } from 'react';
import { FaRss, FaRegGem } from 'react-icons/fa';
import { contract } from 'redstone-smartweave';
import { arweave, smartweave, NEWS_CONTRACT } from '../utils/arweave.js'
import Swal from 'sweetalert2';

export default class PodcastHtml extends Component {
    constructor(props) {
        super(props)
        this.state = {
            podcastHeight: null,
            truncated: false,
            smallImage: false,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.loadPodcastHeight()
        })
    }

    loadPodcastHeight() {
        // if we receive loadPodcastHeight from props.
        if (this.props.loadPodcastHeight) {
            this.setState({
                podcastHeight: this.container.offsetHeight
            })
            this.props.loadPodcastHeight(this.state.podcastHeight)
        }
    }

    loadRss = () => {
        console.log(this.props.rss)
        window.open(`https://permacast-cache.herokuapp.com/feeds/${this.props.rss}`, '_blank')
    }

    tipButton = () => {
        return <button className="btn btn-sm btn-outline" onClick={() => this.tipPrompt()}><FaRegGem className='mr-2' /> Tip</button>
    }

    checkNewsBalance = async (addr, tipAmount) => {
        const contract = contract(NEWS_CONTRACT)
        const state = await contract.readState();
        if (state.balances.hasOwnProperty(addr) && state.balances.addr >= tipAmount) {
            return true
        } else {
            return false
        }
    }

    transferNews = async (recipient, tipAmount) => {
        const input = { "function": "transfer", "target": recipient, "qty": parseInt(tipAmount) };
        const contract = contract(NEWS_CONTRACT);
        const tx = await contract.writeInteraction(arweave, "use_wallet", NEWS_CONTRACT, input);
        console.log(tx);
    }

    tipPrompt = async () => {

        Swal.fire({
            title: 'Coming soon',
            text: 'Tip your favorite podcasts with $NEWS to show support',
            customClass: "font-mono",
        })

        return false

        const addr = await window.arweaveWallet.getActiveAddress();

        const podcastId = this.props.id;
        const name = this.props.name;
        const recipient = this.props.owner;
        const { value: tipAmount } = await Swal.fire({
            title: `Tip ${name} 🙏`,
            input: 'text',
            inputPlaceholder: 'Amount to tip ($NEWS)',
            confirmButtonText: 'Tip'
        });

        if (tipAmount && this.checkNewsBalance(addr, tipAmount)) {

            let n = parseInt(tipAmount);
            if (Number.isInteger(n) && n > 0) {

                if (this.transferNews(recipient, tipAmount)) {

                    Swal.fire({
                        title: 'You just supported a great podcast 😻',
                        text: `${name} just got ${tipAmount} $NEWS.`
                    })

                } else {
                    Swal.fire({
                        title: 'Enter a whole number of $NEWS to tip.'
                    })
                }
            }
        }
    }

    episodeCount = (count) => {
        if (count == 1) {
            return `${count} episode`
        } else {
            return `${count} episodes`
        }
    }

    render() {
        const { podcastHeight } = this.state
        return (
            <div className={`card text-center h-full ${!this.props.smallImage && "shadow-2xl hover:cursor-pointer hover:border"}`} ref={e => { this.container = e }}>
                <div className={`px-2 pt-3 md:px-5 md:pt-5 ${this.props.smallImage && "w-2/5 h-auto mx-auto"}`}>
                    <a href={`/#/podcasts/${this.props.link} `}>
                        <figure className="aspect-h-1 aspect-w-1">
                            {/*!this.props.rss && <Badge className="episode-badge" bg="info">{this.episodeCount(this.props.episodes)}</Badge>*/} {/* TODO: stick badge to bounds of cover image, don't guess */}
                            <img className="object-cover pointer-events-none group-hover:opacity-75 rounded-xl" alt={`${this.props.name} cover`} src={this.props.image} />
                        </figure>
                    </a>
                </div>
                <div className='card-body pt-3 pb-1'>
                    <div className="card-title text-sm md:text-lg">
                        {this.props.name} {this.props.rss ? <span><button className="btn btn-sm bg-yellow-400 border-none" onClick={() => this.loadRss()}><FaRss /></button> {this.tipButton()} </span> : null} </div>
                    <p className="text-sm mb-2">
                        {this.props.truncated && this.props.description.length > 52 ? this.props.description.substring(0, 52) + '...' : this.props.description}
                    </p>
                </div>
            </div >
        )
    }

}
