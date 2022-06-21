import { React, useState } from 'react'
import { SortAscendingIcon } from '@heroicons/react/solid'
import { Transition } from '@headlessui/react'

export function Dropdown({filters, selection, changeSorting}) {
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
            {filters.map((filter, index) => (
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
                {filter.desc}
              </li>
            ))}
          </ul>
        </div>
      </Transition>
    </div>
  )
}
