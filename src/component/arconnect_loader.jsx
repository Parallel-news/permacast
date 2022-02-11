import { React, Component } from 'react'
import UploadShow from './upload_show.jsx'

import Swal from 'sweetalert2'

const requiredPermissions = ['ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES', 'SIGNATURE', 'SIGN_TRANSACTION']

export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      walletConnected: false,
      address: undefined
    };
  }

  // add ArConnect event listeners
  componentDidMount = () => {
    window.addEventListener('arweaveWalletLoaded', this.walletLoadedEvent)
    window.addEventListener('walletSwitch', this.walletSwitchEvent)
  }

  // remove ArConnect event listeners
  componentWillUnmount = () => {
    window.removeEventListener('arweaveWalletLoaded', this.walletLoadedEvent)
    window.removeEventListener('walletSwitch', this.walletSwitchEvent)
  }

  // wallet address change event
  // when the user switches wallets
  walletSwitchEvent = (e) => {
    this.setState({
      address: e.detail.address
    })
  }

  // ArConnect script injected event
  walletLoadedEvent = async () => {
    try {
      // connected, set address
      // (the user can still be connected, but
      // for this actions the "ACCESS_ADDRESS"
      // permission is required. if the user doesn't
      // have that, we still need to ask them to connect)
      this.setState({
        address: await this.getAddr(),
        walletConnected: true
      })
    } catch {
      // not connected
      this.setState({
        address: undefined,
        walletConnected: false
      })
    }
  }

  installArConnectAlert = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Install ArConnect to continue',
      text: 'Permablog uses ArConnect to make it easier to authenticate and send transactions for questions and answers',
      footer: '<a href="https://arconnect.io" rel="noopener noreferrer" target="_blank">Download ArConnect here</a>',
      customClass: "font-mono",
    })
  }

  getAddr = () => window.arweaveWallet.getActiveAddress()

  arconnectConnect = async () => {
    if (window.arweaveWallet) {
      try {
        await window.arweaveWallet.connect(requiredPermissions)
        const address = await this.getAddr()

        this.setState({
          walletConnected: true,
          address
        })
      } catch { }
    } else {
      this.installArConnectAlert()
    }
  }

  arconnectDisconnect = async () => {
    await window.arweaveWallet.disconnect()
    this.setState({
      walletConnected: false,
      address: undefined
    })
  }

  render() {
    return (
      <div>
        {/** if the wallet is connected, display the logout btn, else display login */}
        {(this.state.walletConnected && (
          <>
            <UploadShow />
            <div
              className="btn btn-outline btn-secondary btn-sm md:btn-md text-sm md:text-md hidden md:flex"
              onClick={this.arconnectDisconnect}
            >
              Logout
            </div>
          </>
        )) || (
            <div
              className='btn btn-primary btn-sm md:btn-md text-sm md:text-md'
              onClick={this.arconnectConnect}
            >
              🦔 ArConnect login
            </div>
          )}
      </div>
    )
  }

}