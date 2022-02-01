import { React, Component } from 'react'
import { Navbar, Row, Image, Button } from 'react-bootstrap'
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
        html: '<ul>' +
        '<li>Generate a Spotify & Apple-compliant RSS feed for any podcast</li>' +
        '<li>Tip your favorite podcasts with $NEWS</li>' +
        '<li>Episodes are atomic NFTs, listable on Verto!</li>' +
        '</ul>'
      }
    )
  }

  loadEmail = () => {
    window.open('https://t.me/permacast');
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
  return(
    <div className="topBar">
        <Navbar className="">
        <NavLink className="btn navbar-item text-decoration-none" to="/"><Navbar.Brand><Image className="header-icon" src={YellowRec}/>permacast</Navbar.Brand></NavLink>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <div className="d-flex">
            <Navbar.Text>
                <Row className="flex-row">
                  <Button onClick={() => this.loadEmail()} variant="link" className="navbar-item text-decoration-none mr-2 mobile-hide">📨 Get help</Button>
                  <Button onClick={() => this.loadWhatsNew()} variant="link" className="navbar-item text-decoration-none mr-2 mobile-hide">✨ What's new</Button>
                  <ArConnectLoader />
                </Row>
            </Navbar.Text>
            </div>
        </Navbar.Collapse>
        </Navbar>
    </div>
    )
  }
}