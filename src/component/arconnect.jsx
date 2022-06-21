import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import { shortenAddress } from '../utils/ui'

const requiredPermissions = ['ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES', 'SIGNATURE', 'SIGN_TRANSACTION']

export default function ArConnect() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [address, setAddress] = useState(undefined)
  const [ansData, setANSData] = useState(undefined)
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
  const walletSwitchEvent = async (e) => {
    setAddress(e.detail.address)
    // setAddress("ljvCPN31XCLPkBo9FUeB7vAK0VC6-eY52-CS-6Iho8U")
    // setANSData(await getANSLabel(e.detail.address))
  }

  // ArConnect script injected event
  const walletLoadedEvent = async () => {
    try {
      // connected, set address
      // (the user can still be connected, but
      // for this actions the "ACCESS_ADDRESS"
      // permission is required. if the user doesn't
      // have that, we still need to ask them to connect)
      const addr = await getAddr()
      setAddress(addr)
      // setAddress("ljvCPN31XCLPkBo9FUeB7vAK0VC6-eY52-CS-6Iho8U")
      // setANSData(await getANSLabel(addr))
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

  // const getANSLabel = async (addr) => {

  //   return ans?.currentLabel
  // }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://ans-testnet.herokuapp.com/profile/${address}`)
        const ans = await response.json()
        const {address_color, currentLabel, avatar = ""} = ans;
        setANSData({address_color, currentLabel, avatar})
      } catch (error) {
        console.error(error)
      }
    };

    fetchData();
  }, [address]);

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
    <div className="grid grid-cols-4 mb-4 text-zinc-100 hover:text-white cursor-pointer">
      <div className="col-start-2 col-span-3">
        {(walletConnected && (
          <>
            <div
              className="btn btn-outline btn-secondary btn-sm md:btn-md text-sm md:text-md normal-case mb-2"
              onClick={arconnectDisconnect}
            >
              {(ansData?.avatar === "") ?
                <div className="rounded-full h-6 w-6 mr-2 btn-secondary" style={{ backgroundColor: ansData?.address_color }}></div> :
                // <img className="mx-auto bg-black rounded-full" src={`https://arweave.net/${props.userInfo.avatar}`} />}
                <div className="rounded-full h-6 w-6 overflow-hidden btn-secondary border-[1px]">
                  <img src={`https://arweave.net/${ansData?.avatar}`} alt="Profile" width="100%" height="100%" />
                </div>}
                <span>
                  {ansData?.currentLabel ? `${ansData?.currentLabel}.ar` : shortenAddress(address)}
                </span>
            </div>
          </>
        )) || (
            <div
              className="bg-zinc-900 hover:bg-zinc-600 p-4 rounded-full text-center"
              onClick={arconnectConnect}
            >
              🦔 {t("connector.login")}
            </div>
          )}
      </div>
    </div>
  )

}