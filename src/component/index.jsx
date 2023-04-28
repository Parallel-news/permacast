import React,{  useState, useEffect } from 'react'
import PodcastHtml from './podcast_html.jsx'
import { MESON_ENDPOINT } from '../utils/arweave.js'
import { useTranslation } from 'react-i18next'
import { fetchPodcasts, sortPodcasts } from '../utils/podcast.js'
import { Dropdown } from '../component/podcast_utils.jsx'

export default function Index() {
  const [loading, setLoading] = useState(false)
  const [podcastsHtml, setPodcastsHtml] = useState([])
  const { t } = useTranslation()
  const [sortedPodcasts, setSortedPodcasts] = useState()
  const [selection, setSelection] = useState(0)
  const filters = [
    {type: "episodescount", desc: t("sorting.episodescount")},
    {type: "podcastsactivity", desc: t("sorting.podcastsactivity")}
  ]
  const filterTypes = filters.map(f => f.type)

  const renderPodcasts = (podcasts) => {
    let html = []
    for (const p of podcasts) {
      if (p && p.pid !== 'aMixVLXScjjNUUcXBzHQsUPmMIqE3gxDxNAXdeCLAmQ') {
        html.push(
          <PodcastHtml
            name={p.podcastName}
            episodes={p.episodes.length}
            link={p.pid}
            description={p.description}
            image={`${MESON_ENDPOINT}/${p.cover}`}
            key={p.pid}
            truncated="true"
          />
        )
      }
    }
    return html
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const sorted = await sortPodcasts(filterTypes)
      const podcastsHtml = renderPodcasts(sorted[filterTypes[selection]])
      setPodcastsHtml(podcastsHtml)
      setSortedPodcasts(sorted)
      setLoading(false)
    }
    fetchData()
  }, [])

  const changeSorting = (n) => {
    const filteredPodcasts = sortedPodcasts[filterTypes[n]]
    const newPodcasts = renderPodcasts(filteredPodcasts)
    setPodcastsHtml(newPodcasts)
    setSelection(n)
  }

  return (
    <div>
      <div className="flex items-center justify-center p-2 md:p-6 text-md">
        {loading ? t("loading") : podcastsHtml.length === 0 ? t("nopodcasts") : null}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-3 xl:gap-x-36 mb-10">
        <div className="col-start-1 md:col-start-3 lg:col-start-3">
          {loading ? "":  <Dropdown filters={filters} selection={selection} changeSorting={changeSorting} disabled={loading} />}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-3 xl:gap-x-36 mb-10">
        {podcastsHtml}
      </div>
    </div>
  )

}

