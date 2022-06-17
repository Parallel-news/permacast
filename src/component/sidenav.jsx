import React from 'react';
import { HomeIcon, CollectionIcon, TranslateIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';

export default function Sidenav() {
  return (
    <div className="w-[100px] h-screen py-11 border-r">
      <svg className="px-9"><rect xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#ffff00"/></svg>
      <div className="px-10 grid rows-5 gap-10">
        <HomeIcon color="white" width="26" height="26" />
        <CollectionIcon color="lightgray" width="26" height="26" />
        <TranslateIcon color="lightgray" width="26" height="26" />
        <PlusIcon color="lightgray" width="26" height="26" />
        <QuestionMarkCircleIcon color="lightgray" width="26" height="26" />
      </div>
    </div>
  )
}