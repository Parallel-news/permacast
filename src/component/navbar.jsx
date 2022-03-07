import { useState, useEffect } from 'react'
import YellowRec from '../yellow-rec.svg'
import Swal from 'sweetalert2'
import ArConnectLoader from './arconnect_loader'
import { isDarkMode } from '../utils/theme'
import { themeChange } from "theme-change";
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

// const language = {
//   "zh": "简体中文",
//   "en": "English"
// }
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
    <div className="navbar mb-2 shadow-lg rounded-box">
      <a className="flex-1 px-2 mx-2" href="/">
        <img className="block h-5 w-auto mt-1" src={YellowRec} alt="permacast" />
        <span>permacast</span>
      </a>
      <div className="mx-2 hidden md:flex">
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
      <div className="dropdown dropdown-hover inline-block">
        <label tabindex="0" className="btn btn-ghost font-normal mr-1">{t("Language")}<ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" /> </label>
        <ul tabindex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-30">
          {language.map(l => (
            <li key={l.code}>
              <span onClick={() => changeLanguage(l.code)}>{l.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <ArConnectLoader />
    </div >
  )
}