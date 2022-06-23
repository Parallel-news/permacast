import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import { shortenAddress } from '../utils/ui'
import { SortAscendingIcon } from '@heroicons/react/solid'
import { Transition } from '@headlessui/react'

const requiredPermissions = ['ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES', 'SIGNATURE', 'SIGN_TRANSACTION']


export function Dropdown({choices, selection, changeSorting}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-10 inline-block text-left float-right">
      <button onClick={() => setOpen(!open)}
        className={`
          btn btn-outline btn-secondary
          z-10
          px-4
          py-3
          text-sm
          rounded-lg
          text-center
          font-medium
          float-right
          inline-flex
          items-center
          flex-shrink-0
          shadow-lg
          border
          border-transparent
          hover:border-gray-200
      `}>
        <SortAscendingIcon className={`h-5 w-5`} />
      </button>
      <Transition
        show={open}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-95"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-95"
      >
        <div className="origin-top-right absolute right-0 mt-14 w-44 shadow-lg select-none">
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box">
            {choices.map((choice, index) => (
              <li key={index} onClick={() => {
                changeSorting(index)
                setOpen(!open);
              }} className={`
                rounded-lg
                bg-base-100
                py-2
                px-4
                w-full
                inline-flex
                cursor-pointer
                ${selection === index ? 'bg-base-300' : 'hover:bg-base-200'}
              `}>
                {choice.desc}
              </li>
            ))}
          </ul>
        </div>
      </Transition>
    </div>
  )
}


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
    <div className="grid grid-cols-6 mb-4 text-zinc-100 hover:text-white cursor-pointer">
      <div className="col-start-2 col-span-5">
        {(walletConnected && (
          <>
            <div
              className="btn btn-outline btn-secondary btn-sm md:btn-md text-sm md:text-md normal-case mb-2"
              onClick={arconnectDisconnect}
            >
              <span>
                {ansData?.currentLabel ? `${ansData?.currentLabel}.ar` : shortenAddress(address)}
              </span>
              {(ansData?.avatar === "") ?
                <div className="rounded-full h-6 w-6 ml-2 btn-secondary" style={{ backgroundColor: ansData?.address_color }}></div> :
                // <img className="mx-auto bg-black rounded-full" src={`https://arweave.net/${props.userInfo.avatar}`} />}
                <div className="rounded-full h-6 w-6 overflow-hidden btn-secondary border-[1px]">
                  <img src={`https://arweave.net/${ansData?.avatar}`} alt="Profile" width="100%" height="100%" />
                </div>}
            </div>
          </>
        )) || (
            <div
              className="bg-zinc-900 hover:bg-zinc-600 py-[14px] px-3 rounded-full text-center"
              onClick={arconnectConnect}
            >
              🦔 {t("connector.login")}
            </div>
          )}
      </div>
    </div>
  )

}