import { React, Component } from 'react'
import { Navbar, Row, Image, Button } from 'react-bootstrap'
import YellowRec from '../yellow-rec.svg'
import { NavLink } from 'react-router-dom'
import Swal from 'sweetalert2'
import ArConnectLoader from './arconnect_loader'

export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  loadWhatsNew = () => {
    Swal.fire(
      {
        title: 'Coming in permacast V2 ✨',
        html: '<ul>' +
        '<li>Log in with ArConnect</li>' + 
        '<li>Tip your favorite podcasts with $NEWS</li>' +
        '<li>Stake $NEWS on your favorite podcasts and get rewarded when the podcast is tipped</li>' +
        '<li>Generate an RSS feed for any podcast</li>' +
        '<li>Automatic RSS3 feed generation by crawling the podcast SmartWeave contracts</li>' +
        '</ul>'
      }
    )
  }

  componentDidMount = async () => {
    this.setState({addr: await this.getAddr()})
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
                  <Button onClick={() => this.loadWhatsNew()} variant="link" className="navbar-item text-decoration-none mr-2 mobile-hide">🔮 Soon</Button>
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