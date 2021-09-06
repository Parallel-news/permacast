import { React, Component } from 'react';
import { Card, Image } from 'react-bootstrap';

export default class PodcastHtml extends Component {

    render() {
        return(    
            <Card className="text-center p-3 border-0">
                <a href={`/#/podcasts/${this.props.link}`}><Image className="podcast-grid-cover" alt={`${this.props.name} cover`} src={this.props.image} /></a>
                <h3>{this.props.name}</h3>
                <p>{this.props.description}</p>
            </Card>
        )
    }

}