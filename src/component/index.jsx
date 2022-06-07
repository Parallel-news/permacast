import { React, useState, useEffect } from 'react'
import PodcastHtml from './podcast_html.jsx'
import { MESON_ENDPOINT } from '../utils/arweave.js'
import { useTranslation } from 'react-i18next'
import { fetchPodcasts, sortPodcasts } from '../utils/podcast.js'

export default function Index() {
  const [loading, setLoading] = useState(false)
  const [podcastsHtml, setPodcastsHtml] = useState([])
  const { t } = useTranslation()
  const [sortedPodcasts, setSortedPodcasts] = useState()
  const [counter, setCounter] = useState(0)
  const filters = [
    {type: "default", desc: t("sorting.default")},
    {type: "podcastsactivity", desc: t("sorting.podcastsactivity")},
    {type: "episodescount", desc: t("sorting.episodescount")}
  ]
  const filterTypes = filters.map(f => f.type)
  const currentSelection = () => counter % filterTypes.length

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
      const podcasts = await fetchPodcasts()
      const sorted = await sortPodcasts(filterTypes)
      const podcastsHtml = renderPodcasts(podcasts)
      sorted['default'] = podcasts
      setPodcastsHtml(podcastsHtml)
      setSortedPodcasts(sorted)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!counter) return
    const filteredPodcasts = sortedPodcasts[filterTypes[currentSelection()]]
    const newPodcasts = renderPodcasts(filteredPodcasts)
    setPodcastsHtml(newPodcasts)  
  }, [counter])


  return (
    <div>
      <div className="flex items-center justify-center p-2 md:p-6 text-md">
        {loading ? t("loading") : podcastsHtml.length === 0 ? t("nopodcasts") : null}
      </div>
      <div 
        className="btn btn-outline btn-secondary btn-sm md:btn-md text-sm md:text-md normal-case" 
        onClick={() => setCounter(counter + 1)}
      >
        {t("sortpodcastsby") +": " + filters[currentSelection()].desc}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-3 xl:gap-x-36 mb-10">
        {podcastsHtml}
      </div>
    </div>
  )

}

