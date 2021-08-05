import React from 'react'
import { Navbar, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import UploadShow from './upload_show.jsx'
import WalletLoader from './wallet_loader.jsx'

export default function Header() {
  return(
    <div className="topBar">
        <Navbar className="">
        <NavLink className="btn navbar-item text-decoration-none mr-4" to="/"><Navbar.Brand>permacast</Navbar.Brand></NavLink>
        <Navbar.Toggle />
       {/* <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/posts">Posts</NavLink>
        <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/new">New</NavLink>
        <NavLink className="btn navbar-item nav-btn" activeClassName="is-active" to="/ama">AMA</NavLink>
        */}
        <Navbar.Collapse className="justify-content-end">
          <div className="d-flex">
            <Navbar.Text>
                <Row className="flex-row">
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