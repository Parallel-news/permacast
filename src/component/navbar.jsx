import { React, Component } from 'react'
import YellowRec from '../yellow-rec.svg'
import { NavLink } from 'react-router-dom'
import Swal from 'sweetalert2'
import ArConnectLoader from './arconnect_loader'
import { getWeaveAggregator } from 'weave-aggregator'


export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  loadWhatsNew = () => {
    Swal.fire(
      {
        title: 'New in permacast V2 ✨',
        html: '<li>Generate a Spotify & Apple-compliant RSS feed for any podcast</li>' +
          '<li>Tip your favorite podcasts with $NEWS</li>' +
          '<li>Episodes are atomic NFTs, listable on Verto!</li>',
        customClass: {
          title: "font-mono",
          htmlContainer: 'list text-left text-md font-mono'
        }
      }
    )
  }

  getAddr = async () => {
    if (await this.loggedIn()) {
      let addr = window.arweaveWallet && await window.arweaveWallet.getActiveAddress()
      return addr
    } else {
      return false
    }
  }

  loggedIn = async () => {
    if (window.arweaveWallet) {
      let permissions = await window.arweaveWallet.getPermissions()
      return permissions.length > 2 && await window.arweaveWallet.getActiveAddress() ? true : false
    }
    else {
      return false
    }
  }


  render() {
    return (
      <div className="navbar mb-2 shadow-lg rounded-box">
        <a className="flex-1 px-2 mx-2" href="/">
          <img className="block h-5 w-auto mt-1" src={YellowRec} alt="permacast" />
          <span>permacast</span>
        </a>
        <div className="mr-5 hidden md:flex">
          <a className="mx-3" href="https://t.me/permacast" target="_blank" rel="noreferrer">📨 Get help</a>
          <span className="mx-3 cursor-pointer" onClick={() => this.loadWhatsNew()}>✨ What's new</span>
        </div >
        <ArConnectLoader />
      </div >
    )
  }
}