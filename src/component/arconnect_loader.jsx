import { React, Component } from 'react'
import { Button } from 'react-bootstrap'
import UploadShow from './upload_show.jsx'

import Swal from 'sweetalert2'

export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      walletConnected: false
    };
  }

  installArConnectAlert = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Install ArConnect to continue',
      text: 'Permablog uses ArConnect to make it easier to authenticate and send transactions for questions and answers',
      footer: '<a href="https://arconnect.io" rel="noopener noreferrer" target="_blank">Download ArConnect here</a>'
    })
  }

  getAddr = async () => {
    let addr = await window.arweaveWallet.getActiveAddress()
    console.log(addr)
    return addr
  }

  arconnectConnect = async () => {
    console.log('clicked connect')
    if (window.arweaveWallet) {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGNATURE', 'SIGN_TRANSACTION'])
      this.setState({walletConnected: true})
      this.setState({addr: await this.getAddr()})
      console.log(this.state)
      localStorage.setItem('walletAddr', JSON.stringify(await this.getAddr()))
    } else {
      this.installArConnectAlert()
    }
  }

  arconnectDisconnect = () => {
    window.arweaveWallet.disconnect()
    this.setState({walletConnected: false})
    localStorage.setItem('walletAddr', JSON.stringify(null))
  }

  render() {
    return (
      <div>
      {localStorage.getItem('walletAddr') !== "null"  ? 
                 <><UploadShow/> <Button className="mobile-hide" variant="outline-danger" onClick={ () => this.arconnectDisconnect() }>Logout</Button></> :
                 <Button variant="success" onClick={ () => this.arconnectConnect() }>🦔 ArConnect login</Button>
              }
      </div>
    )
  }

}