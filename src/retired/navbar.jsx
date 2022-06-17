import { useState, useEffect } from 'react'
import YellowRec from '../yellow-rec.svg'
import Swal from 'sweetalert2'
import ArConnectLoader from './arconnect_loader'
import { isDarkMode } from '../utils/theme'
import { themeChange } from "theme-change";
import { useTranslation } from 'react-i18next'
import { Disclosure } from '@headlessui/react'
import { TranslateIcon } from '@heroicons/react/outline'
import { MenuIcon, XIcon } from "@heroicons/react/outline";


const language = [
  {
    "code": "zh",
    "name": "简体中文"
  },
  {
    "code": "en",
    "name": "English"
  }
]

export default function NavBar() {
  const [darkMode, setDarkMode] = useState(isDarkMode())

  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  }, []);

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const loadWhatsNew = () => {
    Swal.fire(
      {
        title: t("navbar.swal.title"),
        html: t("navbar.swal.html"),
        customClass: {
          title: "font-mono",
          htmlContainer: 'list text-left text-md font-mono'
        }
      }
    )
  }

  return (
    <div className="flex gap-x-8 justify-center">
    <Disclosure as="nav" className="mb-2 shadow-lg rounded-box w-full md:w-2/3">
      {({ open }) =>
        <>

          <div className="navbar">
            <a className="flex-1 px-2 mx-2" href="/">
              <img className="block h-5 w-auto mt-1" src={YellowRec} alt="permacast" />
              <span>permacast</span>
            </a>

            <div className="mx-3 hidden md:flex">
              <a className="mx-3" href="https://t.me/permacast" target="_blank" rel="noreferrer">📨 {t("navbar.help")}</a>
              <span className="mx-3 cursor-pointer" onClick={() => loadWhatsNew()}>✨ {t("navbar.new")}</span>
            </div >
            <button className="mr-3" onClick={() => setDarkMode(!darkMode)}>
              {
                darkMode ?
                  <svg data-set-theme="light" className="transition transform origin-center fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
                  : <svg data-set-theme="dark" className="transition transform origin-center rotate-90 fill-current w-5 h-5 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
              }
            </button>
            <div className="dropdown dropdown-hover hidden md:inline-block mx-3">
              <label tabIndex="0">
                <TranslateIcon className="h-5 w-5" aria-hidden="true" />
              </label>
              <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                {language.map(l => (
                  <li key={l.code}>
                    <span onClick={() => changeLanguage(l.code)}>{l.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mr-2 flex sm:hidden">
              <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="dropdown dropdown-hover block px-3 py-2 rounded-md">
                <label tabIndex="0">
                  <TranslateIcon className="h-5 w-5" aria-hidden="true" />
                </label>
                <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                  {language.map(l => (
                    <li key={l.code}>
                      <span onClick={() => changeLanguage(l.code)}>{l.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Disclosure.Button
                as="a"
                href="https://t.me/permacast"
                target="_blank" rel="noreferrer"
                className="block px-3 py-2 rounded-md"
              >
                📨 {t("navbar.help")}
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                className="block px-3 py-2 rounded-md"
              >
                <span onClick={() => loadWhatsNew()}>
                  ✨ {t("navbar.new")}
                </span>
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                className="block px-3 py-2 rounded-md"
              >
                <ArConnectLoader />
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>}
    </Disclosure >
     <Disclosure as="nav" className="hidden md:grid">
     <div className="mx-auto mt-2 px-3 mb-2 shadow-lg rounded-box">
              <ArConnectLoader />
            </div>
     </Disclosure>
     </div>
  )
}