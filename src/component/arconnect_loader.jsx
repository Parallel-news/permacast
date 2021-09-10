import { React, Component } from 'react'
import { Navbar, Button, NavLink } from 'react-bootstrap'
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

  arconnectConnect = () => {
    if (window.arweaveWallet) {
      window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGNATURE', 'SIGN_TRANSACTION'])
      this.setState({walletConnected: true})
    } else {
      this.installArConnectAlert()
    }
  }

  arconnectDisconnect = () => {
    window.arweaveWallet.disconnect()
    this.setState({walletConnected: false}) 
  }

  render() {
    return (
      <div>
      {this.state.walletConnected ? 
                 <Button variant="outline-danger" onClick={ () => this.arconnectDisconnect() }>Logout</Button> :
                 <Button variant="success" onClick={ () => this.arconnectConnect() }>🦔 ArConnect login</Button>
              }
      </div>
    )
  }

}