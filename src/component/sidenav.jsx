import React from 'react';
import { HomeIcon, CollectionIcon, TranslateIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import Cooyub from './cooyub';

export default function Sidenav() {
  return (
    <div className="w-[100px] h-screen pt-11 ">
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