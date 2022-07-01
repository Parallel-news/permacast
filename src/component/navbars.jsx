import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { Disclosure } from '@headlessui/react'
import { HomeIcon, CollectionIcon, TranslateIcon, PlusIcon, QuestionMarkCircleIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import YellowRec from '../yellow-rec.svg'
import { Cooyub } from './icons';
import ArConnect from './arconnect';
import {Searchbar, SearchbarMobile} from './searchbar';

export function Sidenav({appState}) {
  return (
    <div className="w-[100px] h-full pt-11 ">
      <Cooyub svgStyle="ml-9 w-9 h-9" rectStyle="w-9 h-9" fill="#ffff00" />
      <div className="ml-10 mt-10 grid rows-5 gap-10 text-zinc-400">
        <HomeIcon color="white" width="28" height="28" />
        <CollectionIcon width="28" height="28" />
        <TranslateIcon width="28" height="28" />
        <PlusIcon width="28" height="28" />
        <QuestionMarkCircleIcon width="28" height="28" />
      </div>
    </div>
  )
}

export function NavBar({appState}) {
  return (
    <>
      <div className="md:hidden">
        <NavBarMobile appState={appState} />
      </div>
      <div className="hidden md:block">
        <div className="flex">
          <div className="w-4/5">
            <Searchbar />
          </div>
          <div className="w-72">
            <ArConnect appState={appState} />
          </div>
        </div>
      </div>
    </>
  )
}

export function NavBarMobile({appState}) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
  
  const loadWhatsNew = () => Swal.fire({
    title: t("navbar.swal.title"),
    html: t("navbar.swal.html"),
    customClass: {
      title: "font-mono",
      htmlContainer: 'list text-left text-md font-mono'
    }
  })
  

  return (
    <div className="border border-zinc-400 rounded-lg text-white p-2">
      <div className="flex gap-x-8 px-2 justify-center">
        <Disclosure as="nav" className="shadow-lg rounded-box w-full">
        {({ open }) =>
          <>
            <div className="navbar flex items-center">
              <div className="flex-1" href="/">
                <div className="flex w-full items-center ">
                  <img className="block h-5 w-auto mr-2" src={YellowRec} alt="permacast" />
                  <div className="w-full mx-2">
                    <SearchbarMobile appState={appState} />
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
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
            <Disclosure.Panel>
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
                  <ArConnect appState={appState} />
                </Disclosure.Button>
              </div>
            </Disclosure.Panel>
          </>}
        </Disclosure>
        <Disclosure as="nav" className="hidden md:grid">
          <div className="mx-auto mt-2 px-3 mb-2 shadow-lg rounded-box">
            <ArConnect appState={appState} />
          </div>
        </Disclosure>
      </div>

    </div>
  )
}
