import React from 'react'
import { Navbar, Row, Image, Button } from 'react-bootstrap'
import YellowRec from '../yellow-rec.svg'
import { NavLink } from 'react-router-dom'
import UploadShow from './upload_show.jsx'
import WalletLoader from './wallet_loader.jsx'
import Swal from 'sweetalert2'

export default function Header() {

  const loadWhatsNew = () => {
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

  return(
    <div className="topBar">
        <Navbar className="">
        <NavLink className="btn navbar-item text-decoration-none" to="/"><Navbar.Brand><Image className="header-icon" src={YellowRec}/>permacast</Navbar.Brand></NavLink>
        <Navbar.Toggle />
       {/* <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/posts">Posts</NavLink>
        <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/new">New</NavLink>
        <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/ama">AMA</NavLink>
        */}
        <Navbar.Collapse className="justify-content-end">
          <div className="d-flex">
            <Navbar.Text>
                <Row className="flex-row">
                  <Button onClick={() => loadWhatsNew()} variant="link" className="navbar-item text-decoration-none mr-4">What's coming 🔮</Button>
                 { sessionStorage.getItem("arweaveWallet") ? <UploadShow/> : null }
                  <WalletLoader/>
                </Row>
            </Navbar.Text>
            </div>
        </Navbar.Collapse>
        </Navbar>
    </div>
  )
}