import { React, Component } from 'react'
import { Button } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'
import UploadEpisode from './upload_episode.jsx'

class Podcast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true,
            thePodcast: this.getPodcast()
        }
    }

    getPodcast = () => {
        let id = this.props.match.params.podcastId;
        let podcasts = this.props.podcasts.podcasts
        let podcast = this.findPodcastById(podcasts, id)
        return podcast
    }

    findPodcastById = (podcasts, id) => {
      for (var i=0, iLen=podcasts.length; i<iLen; i++) {
        if (podcasts[i].id === id)
          return podcasts[i];
        }
    }

    loadPodcast() {
      const p = this.getPodcast()
      const podcastHtml = []
      podcastHtml.push(
          <div>
            <PodcastHtml
            link={p.id}
            name={p.name}
            description={p.description}
            image={p.image}
            media={p.media}
            />
          </div>
      )
      return podcastHtml
    }

    loadEpisodes() {
      const p = this.getPodcast()
      const ep = p.episodes
      const episodeList = []
      for (let i in ep) {
        let e = ep[i]
        episodeList.push(
          <div>
            <p>{e.title}</p>
            <audio controls>
              <source src={e.media} type="audio/ogg"/>
            </audio>
          </div>
        )
      }
      return episodeList
    }

    showEpisodeForm = () => {
      this.setState({showEpisodeForm: true})

    }

    render() {
        return(
          <div>
            {this.state.thePodcast.owner === sessionStorage.getItem('wallet_address') ? <Button variant="link" onClick={() => this.showEpisodeForm()}>add new episode</Button> : null}
            {this.state.showEpisodeForm ? <UploadEpisode podcast={this.state.thePodcast}/> : null}
            {this.loadPodcast()}
            {this.loadEpisodes()}
          </div>
        )
    }

}

export default Podcast