import { useEffect, useState } from 'react'
import UploadShow from './upload_show.jsx'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

const requiredPermissions = ['ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES', 'SIGNATURE', 'SIGN_TRANSACTION']

export default function Header() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [address, setAddress] = useState(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    // add ArConnect event listeners
    window.addEventListener('arweaveWalletLoaded', walletLoadedEvent)
    window.addEventListener('walletSwitch', walletSwitchEvent)
    return () => {
      // remove ArConnect event listeners
      window.removeEventListener('arweaveWalletLoaded', walletLoadedEvent)
      window.removeEventListener('walletSwitch', walletSwitchEvent)
    }
  })

  // wallet address change event
  // when the user switches wallets
  const walletSwitchEvent = (e) => {
    setAddress(e.detail.address)
  }

  // ArConnect script injected event
  const walletLoadedEvent = async () => {
    try {
      // connected, set address
      // (the user can still be connected, but
      // for this actions the "ACCESS_ADDRESS"
      // permission is required. if the user doesn't
      // have that, we still need to ask them to connect)
      setAddress(await getAddr())
      setWalletConnected(true)
    } catch {
      // not connected
      setAddress(undefined)
      setWalletConnected(false)
    }
  }

  const installArConnectAlert = () => {
    Swal.fire({
      icon: "warning",
      title: t("connector.swal.title"),
      text: t("connector.swal.text"),
      footer: `<a href="https://arconnect.io" rel="noopener noreferrer" target="_blank">${t("connector.swal.footer")}</a>`,
      customClass: "font-mono",
    })
  }

  const getAddr = () => window.arweaveWallet.getActiveAddress()

  const arconnectConnect = async () => {
    if (window.arweaveWallet) {
      try {
        await window.arweaveWallet.connect(requiredPermissions)
        setAddress(await getAddr())
        setWalletConnected(true)

      } catch { }
    } else {
      installArConnectAlert()
    }
  }

  const arconnectDisconnect = async () => {
    await window.arweaveWallet.disconnect()
    setWalletConnected(false)
    setAddress(undefined)
  }

  return (
    <div>
      {/** if the wallet is connected, display the logout btn, else display login */}
      {(walletConnected && (
        <>
          <UploadShow />
          <div
            className="btn btn-outline btn-secondary btn-sm md:btn-md text-sm md:text-md hidden md:flex"
            onClick={arconnectDisconnect}
          >
            {t("connector.logout")}
          </div>
        </>
      )) || (
          <div
            className='btn btn-primary btn-sm md:btn-md text-sm md:text-md'
            onClick={arconnectConnect}
          >
            🦔 {t("connector.login")}
          </div>
        )}
    </div>
  )

}