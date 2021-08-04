import { React, Component } from 'react'
import { CardColumns } from 'react-bootstrap'
import PodcastHtml from './podcast_html.jsx'

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            test: true
        }
    }

    linkValues = (podcast) => {
      const keys = Object.keys(podcast)
      console.log(keys)
      const values =  Object.values(podcast)
      const resultArr = []
    
      for ( let i = 0 ; i < keys.length ; i++) {
        const currentValues = values[i]
        const currentKey = keys[i]
        currentValues["pid"] = currentKey
        resultArr.push(currentValues)
    
      }
      return resultArr
    }
    


    podcasts = () => {
        const podcast = this.linkValues(this.props.podcasts.podcasts);
        const podcasts = []
        for (let i in podcast) {
          let p = podcast[i];
          podcasts.push(
            <>
            <PodcastHtml
            name={p.podcastName}
            link={p.pid}
            description={p.description}
            image={`https://arweave.net/${p.cover}`}
            media={p.media}
            />
            </>
          )
        }
        return podcasts
    }


    render() {
        return(
          <>
          <CardColumns>
          {this.podcasts()}
          </CardColumns>
          </>
        )
    }

}

export default Index