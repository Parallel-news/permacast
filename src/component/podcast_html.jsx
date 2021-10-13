import { React, Component } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { FaRss, FaRegGem } from 'react-icons/fa'
import Swal from 'sweetalert2'

export default class PodcastHtml extends Component {

    loadRss = () => {
        window.open(`https://permacast.herokuapp.com/rss/${this.props.rss}`, '_blank')
    }

    tipButton = () => {
        return <Button variant="outline-secondary" onClick={() => this.showComingSoonAlert()} size="sm"><FaRegGem/> Tip</Button>
    }

    showComingSoonAlert = () => {
        Swal.fire(
            'Tips are coming soon, watch this space 👀'
        )
    }
    
    

    render() {
        console.log('rss')
        console.log(this.props.rss)
        return(    
            <Card className="text-center p-3 border-0">
                <a href={`/#/podcasts/${this.props.link}`}><Image className="podcast-grid-cover" alt={`${this.props.name} cover`} src={this.props.image} /></a>
                <div className={this.props.titleClass || 'h3'}>{this.props.name} { this.props.rss ? <span><Button size="sm" className="rss-button" onClick={() => this.loadRss()}><FaRss/></Button>  {this.tipButton()}  </span> : null } </div>
                <p>{this.props.description}</p>
            </Card>
        )
    }

}