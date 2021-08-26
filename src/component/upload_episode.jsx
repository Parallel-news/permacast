import { React, Component } from 'react'
import { Col, Container, Button, Form, Card } from 'react-bootstrap'
import Arweave from 'arweave'
import ArDB from 'ardb'
import { interactWrite } from 'smartweave'
import swal from 'sweetalert'

const masterContract = 'Yi5WAFCNt8w8TS20K5qs1XItwcXzVJqD3pAE-cgnlRE'

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 100000,
    logging: false,
  });

const ardb = new ArDB(arweave)

export default class UploadEpisode extends Component {
     constructor(props) {
        super(props);
        this.state = {
            test: true,
        }
    }

    readFileAsync = (file) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
        
            reader.onload = () => {
             resolve(reader.result);
            };
        
            reader.onerror = reject;

            reader.readAsArrayBuffer(file);
        })
    }


    processFile = async (file) => {
        try {
          let contentBuffer = await this.readFileAsync(file);
          console.log(contentBuffer)
          return contentBuffer
        } catch(err) {
          console.log(err);
        }
      }

    uploadToArweave = async (data, fileType, epObj, event) => {
      const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"));
      if (!wallet) { return null } else {
        arweave.createTransaction({ data: data }, wallet).then((tx) => {
          tx.addTag("Content-Type", fileType);
          arweave.transactions.sign(tx, wallet).then(() => {
            arweave.transactions.post(tx, wallet).then((response) => {
              if (response.statusText === "OK") {
                  epObj.audio = tx.id
                  console.log(tx.id)
                  this.uploadShow(epObj)
                  event.target.reset()
                  swal('Upload complete', 'Episode uploaded permanently to Arweave. Check in a few minutes after the transaction has mined.', 'success')
              } else {
                  swal('Upload failed', 'Check your AR balance and network connection', 'danger')
              }
            });
          });
        });
        console.log(epObj)
        //await this.uploadShow(epObj)
      }
    }
  
    handleEpisodeUpload = async (event) => {
       let epObj = {}
       event.preventDefault()
        epObj.name = event.target.episodeName.value
        epObj.desc = event.target.episodeShowNotes.value
        epObj.index = this.props.podcast.pid
        let episodeFile = event.target.episodeMedia.files[0]
        let fileType = episodeFile.type
        console.log(fileType)
        this.processFile(episodeFile).then((file) => {
           this.uploadToArweave(file, fileType, epObj, event)
       })
       }

      getSwcId = async () => {
        let tx
        const addr = sessionStorage.getItem("wallet_address");
        if (!addr) { return null } else {
        tx = await ardb.search('transactions')
        .from(addr)
        .tag('App-Name', 'SmartWeaveAction')
        .tag('Action', 'launchCreator')
        .tag('Protocol', 'permacast-testnet-v3')
        .tag('Contract-Src', 'Yi5WAFCNt8w8TS20K5qs1XItwcXzVJqD3pAE-cgnlRE')
        .find()
        }
        return tx[0]['node']['id']
      }

    uploadShow = async (show) => {
        let theContractId
        const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"))
         theContractId = await this.getSwcId()
         console.log(theContractId)
        console.log(show)
        let input = {
          'function': 'addEpisode',
          'podcast': this.props.podcast.pid,
          'index': this.props.podcast.episodes.length,
          'name': show.name,
          'desc': show.desc,
          'audio': show.audio
        }

        console.log(input)
  
        let tags = { "Contract-Src": masterContract, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain" }
        let test = await interactWrite(arweave, wallet, theContractId, input, tags)
        console.log(test)
      }
    
      toFixed(x) {
        if (Math.abs(x) < 1.0) {
          var e = parseInt(x.toString().split('e-')[1]);
          if (e) {
              x *= Math.pow(10,e-1);
              x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
          }
        } else {
          var e = parseInt(x.toString().split('+')[1]);
          if (e > 20) {
              e -= 20;
              x /= Math.pow(10,e);
              x += (new Array(e+1)).join('0');
          }
        }
        return x;
      }
      
      calculateUploadFee = (file) => {
        console.log('fee reached')
        let fee  = 0.0124 * (file.size / 1024 / 1024).toFixed(4)
        this.setState({showUploadFee: fee})
      }

    render() {
        
        const podcast = this.props.podcast
        const podcastName = podcast.podcastName
        
        return(
            <div>
                <Container className="d-flex border-dark justify-content-center">
                <Col className="justify-content-center" lg={8}>
                <Card className="border-dark">  
                <Card.Header><Card.Title className="mt-3">Add new episode to {podcastName}</Card.Title></Card.Header>
                <Form className="p-4" hasValidation onSubmit={this.handleEpisodeUpload}>
                <Form.Group className="mb-3" controlId="podcastName">
                    <Form.Label>Episode name</Form.Label>
                    <Form.Control required type="text" name="episodeName" placeholder="EP1: Introduction" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="episodeShowNotes">
                    <Form.Label>Episode description</Form.Label>
                    <Form.Control required as="textarea" name="episodeShowNotes" placeholder="In this episode..." rows={3} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="episodeMedia" />
                <Form.Label>Audio file</Form.Label>
                <Form.Control className="audio-input" required type="file" onChange={(e) => this.calculateUploadFee(e.target.files[0])} name="episodeMedia"/>
                {this.state.showUploadFee ? <p className="text-gray p-3">~${this.state.showUploadFee} to upload</p> : null }
                <br/><br/>
                <Button
                  type="submit"
                  variant="success"
                  color="default"
                  component="span"
                >
                  Upload
                </Button>
                </Form>
            </Card>
            </Col>
            </Container>
            </div>
        )
    }

}