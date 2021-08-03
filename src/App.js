import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import './App.css';
import Header from './component/navbar.jsx'
import Podcast from './component/podcast.jsx'
import Index from './component/index.jsx'

const allPodcasts = {
  'podcasts' : [
    {
      'id' : '1',
      'owner' : 'kaYP9bJtpqON8Kyy3RbqnqdtDBDUsPTQTNUCvZtKiFI',
      'name' : 'The Arweave Show',
      'description' : 'A show about the most exciting projects built on top of the blockweave.',
      'image' : 'https://pic.onlinewebfonts.com/svg/img_32158.png',
      'episodes' : [
        {
          'title' : 'What is Arweave',
          'media' : 'https://upload.wikimedia.org/wikipedia/commons/7/73/Buick2_671105_RedDog_Marlin.ogg',
        },
        {
          'title' : 'What is Arweave pt.2',
          'media' : 'https://upload.wikimedia.org/wikipedia/commons/7/73/Buick2_671105_RedDog_Marlin.ogg',
        },
        {
          'title' : 'What is Arweave pt.3',
          'media' : 'https://upload.wikimedia.org/wikipedia/commons/7/73/Buick2_671105_RedDog_Marlin.ogg',
        },

      ]
    },
    {
      'id' : '2',
      'name' : 'Logical Philosophy for the Advanced Mind',
      'description' : 'A fun-loving romp through the historical textbooks of formal logic.',
      'image' : 'https://sweetclipart.com/multisite/sweetclipart/files/imagecache/middle/0000ff%20Color%20Square%20Yellow.png',
    },
    {
      'id' : '3', 
      'name' : 'Blockweave Digest',
      'description' : "When you try to PoW but accidentally SPoRA and it's good",
      'image' : 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b6bdc544-9c2b-42dc-9e29-5e9508472b63/d5idnkk-885e95e6-550d-426d-8755-a91c974444e0.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwic3ViIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsImF1ZCI6WyJ1cm46c2VydmljZTpmaWxlLmRvd25sb2FkIl0sIm9iaiI6W1t7InBhdGgiOiIvZi9iNmJkYzU0NC05YzJiLTQyZGMtOWUyOS01ZTk1MDg0NzJiNjMvZDVpZG5ray04ODVlOTVlNi01NTBkLTQyNmQtODc1NS1hOTFjOTc0NDQ0ZTAuanBnIn1dXX0.u4Nkuwh2FBBWyy3A0tXAjz4--boyGFxf6Jx4VIDPtsE'
    }
  ]
};

function App() {
  return (
    <div>
      <div className="App p-2">
        <Router>
          <div className="topBar"><Header/></div>
          <Route exact path="/podcasts/:podcastId" render={({match}) => <Podcast match={match} podcasts={allPodcasts}/> } />
          <Route exact path="/" render={() => <Index podcasts={allPodcasts}/>} />
        </Router>
      </div>
    </div>
  );
}

export default App;
