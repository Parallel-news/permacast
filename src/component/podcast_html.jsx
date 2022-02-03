import { React, Component } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { FaRss, FaRegGem } from 'react-icons/fa';
import { contract } from 'redstone-smartweave';
import { arweave, smartweave, NEWS_CONTRACT } from '../utils/arweave.js'
import Swal from 'sweetalert2';

export default class PodcastHtml extends Component {
    constructor(props) {
        super(props)
        this.state = {
            podcastHeight: null
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
        return <Button variant="outline-secondary" onClick={() => this.tipPrompt()} size="sm"><FaRegGem/> Tip</Button>
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
       const input = {"function": "transfer",  "target": recipient, "qty": parseInt(tipAmount)};
       const contract = contract(NEWS_CONTRACT);
       const tx = await contract.writeInteraction(arweave, "use_wallet", NEWS_CONTRACT, input);
       console.log(tx);
    }

    tipPrompt = async () => {

        Swal.fire({
            title: 'Coming soon',
            text: 'Tip your favorite podcasts with $NEWS to show support'
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
        // console.log(this.props.rss)
        const { podcastHeight } = this.state
        return(
            <Card className="text-center p-1 border-0" ref={ e => {this.container = e}}>
                <div className="image-item" style={{ height: '300px'}}>
                    <a href={`/#/podcasts/${this.props.link}`}>
                    {/*!this.props.rss && <Badge className="episode-badge" bg="info">{this.episodeCount(this.props.episodes)}</Badge>*/} {/* TODO: stick badge to bounds of cover image, don't guess */}
                        <Image className="podcast-grid-cover" alt={`${this.props.name} cover`} src={this.props.image} />
                    </a>
                </div>
                <div>
                    <div className={this.props.titleClass || 'h3'}>{this.props.name} { this.props.rss ? <span><Button size="sm" className="rss-button" onClick={() => this.loadRss()}><FaRss/></Button>  {this.tipButton()}  </span> : null } </div>
                    <p>{this.props.description}</p>
                </div>
            </Card>
        )
    }

}
