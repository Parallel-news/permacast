import { React, Component } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { FaRss, FaRegGem } from 'react-icons/fa';
import { readContract, interactWrite } from 'smartweave';
import { arweave, NEWS_CONTRACT } from '../utils/arweave.js'
import Swal from 'sweetalert2';

export default class PodcastHtml extends Component {

    loadRss = () => {
        window.open(`https://permacast.herokuapp.com/rss/${this.props.rss}`, '_blank')
    }

    tipButton = () => {
        return <Button variant="outline-secondary" onClick={() => this.tipPrompt()} size="sm"><FaRegGem/> Tip</Button>
    }

    checkNewsBalance = async (addr, tipAmount) => {
        const state = await readContract(arweave, NEWS_CONTRACT);
        console.log(state);
        if (state.balances.hasOwnProperty(addr) && state.balances.addr >= tipAmount) {
            return true
        } else {
            return false
        }
    }

    transferNews = async (recipient, tipAmount) => {
       const input = {"function": "transfer",  "target": recipient, "qty": tipAmount};
       const tx = await interactWrite(arweave, "use_wallet", NEWS_CONTRACT, input);
       console.log(tx);
    }

    tipPrompt = async () => {

        const addr = await window.arweaveWallet.getActiveAddress();

        const podcastId = this.props.id;
        const name = this.props.name;
        const recipient = this.props.owner;
        const { value: tipAmount } = await Swal.fire({
            title: `Tip ${name} 🙏`,
            input: 'text',
            inputPlaceholder: 'Amount to tip ($NEWS)'
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

    render() {
        console.log('rss')
        console.log(this.props.rss)
        return(    
            <Card className="text-center p-3 border-0">
                <a href={`/#/podcasts/${this.props.link}`}><Image className="podcast-grid-cover" alt={`${this.props.name} cover`} src={this.props.image} /></a>
                <div className={this.props.titleClass || 'h3'}>{this.props.name} { this.props.rss ? <span><Button size="sm" className="rss-button" onClick={() => this.loadRss()}><FaRss/></Button>  {this.tipButton()}  </span> : null } </div>
                <p>{this.props.description}</p>
            </Card>
        )
    }

}