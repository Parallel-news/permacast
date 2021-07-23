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


    podcasts = () => {
        const podcast = this.props.podcasts.podcasts;
        const podcasts = []
        for (let i in podcast) {
          let p = podcast[i];
          podcasts.push(
            <>
            <PodcastHtml
            name={p.name}
            link={p.id}
            description={p.description}
            image={p.image}
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