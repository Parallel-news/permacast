import { React, Component } from 'react'
import { Col, Container, Button, Form, Card } from 'react-bootstrap'
import Arweave from 'arweave'
import Dropzone from 'react-dropzone'
import ArDB from 'ardb'
import { interactWrite } from 'smartweave'

const masterContract = 'vR4pdVS3nSCHMbUMegz1Ll-O1n_4Gs-hZkd4mi0UZS4'

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
          return contentBuffer
        } catch(err) {
          console.log(err);
        }
      }

    uploadToArweave = async (data, fileType, epObj) => {
      const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"));
      if (!wallet) { return null } else {
        arweave.createTransaction({ data: data }, wallet).then((tx) => {
          tx.addTag("Content-Type", fileType);
          arweave.transactions.sign(tx, wallet).then(() => {
            arweave.transactions.post(tx, wallet).then((response) => {
              if (response.statusText === "OK") {
                  epObj.media = tx.id
                  console.log(epObj)
              }
            });
          });
        });
      }
    }
  
    handleEpisodeUpload = async (event) => {
       const fileType = this.state.fileType
       let epObj = {}
       event.preventDefault()
        epObj.name = event.target.episodeName.value
        epObj.desc = event.target.episodeShowNotes.value
       this.processFile(this.state.files[0]).then((file) => {
           this.uploadToArweave(file, fileType, epObj)
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
        .tag('Protocol', 'permacast-testnet-v0')
        .tag('Contract-Src', 'vR4pdVS3nSCHMbUMegz1Ll-O1n_4Gs-hZkd4mi0UZS4')
        .find()
        }
      console.log(tx)
      }

    uploadShow = async (show) => {
        //let id
        const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"))
        //id = !localStorage.getItem('swcId') && getSwcId()
        //if (!id) {
        //  id = createContractFromTx(arweave, wallet, masterContract, '')
        //  localStorage.setItem('swcId', id)
        //console.log(`swcId is ${id}`)
        //}
  
        let input = {
          'function': 'createPodcast',
          'name': show.name,
          'desc': show.desc,
          'cover': show.cover
        }
  
        let tags = { "Contract-Src": masterContract, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain" }
        let test = await interactWrite(arweave, wallet, masterContract, input, tags)
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
      

    render() {
        
        const podcast = this.props.podcast
        const podcastName = podcast.name
        
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
                
                <Dropzone accept="audio/mp3" onDrop={acceptedFiles => this.setState({files: acceptedFiles, fileType: acceptedFiles[0].type, dropped: true})}>
                    {({getRootProps, getInputProps, isDragReject, isDragAccept}) => (
                        <section>
                            <div {...getRootProps()}>
                             <input {...getInputProps()} />
                             {(isDragReject && !isDragAccept) ? "⚠️ Only mp3 audio files accepted" :
                             <Card className="dropzone-border p-2"><span className="text-gray">{ !this.state.dropped ? <p>⬆️ Drop your podcast's audio file here</p> : <p>✅ File added. Cost to upload to Arweave ~{0.00052 * (this.state.files[0].size / 1000000).toFixed(3)}</p>}</span></Card>
                                }
                            </div>
                        </section>
                     )}
                </Dropzone>

               { /*    <Form.Label>Audio file</Form.Label>
                    <Form.Control className="audio-input" required type="file" name="episodeMedia"/> */ }
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