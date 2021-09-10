import { React, Component } from 'react'

export default class PodcastRss extends Component {



  render() {
    let id = this.props.match.params.podcastId;
    return(
      <>{id}</>
    )
  }

}