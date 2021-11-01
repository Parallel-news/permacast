import { React, Component } from 'react'
import { Col, Container, Button, Form, Card } from 'react-bootstrap'
import ArDB from 'ardb'
import { interactWrite } from 'smartweave'
import swal from 'sweetalert'
import { CONTRACT_SRC, NFT_SRC, arweave } from '../utils/arweave.js' 

const ardb = new ArDB(arweave)

export default class UploadEpisode extends Component {
     constructor(props) {
        super(props);
        this.state = {
            test: true,
        }
    }

    listEpisodeOnVerto = (episodeId) => {
      const vertoContractId =  't9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE';
      const input = `{"function":"list","id":${episodeId},"type":"art"}`;
      interactWrite(arweave, "use_wallet", vertoContractId, input);
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
    const wallet = await window.arweaveWallet.getActiveAddress();
    console.log(wallet);
    if (!wallet) {
      return null;
    } else {
      const tx = await arweave.createTransaction({ data: data });
      const initState = `{"issuer": "${wallet}","owner": "${wallet}","name": "${epObj.name}","ticker": "PANFT","description": ${epObj.desc},"balances": {"${wallet}": 1}}`;

      tx.addTag("Content-Type", fileType);
      tx.addTag("App-Name", "SmartWeaveContract");
      tx.addTag("App-Version", "0.3.0");
      tx.addTag("Contract-Src", NFT_SRC);
      tx.addTag("Init-State", initState);
      // Verto aNFT listing
      tx.addTag("Exchange", "Verto");
      tx.addTag("Action", "marketplace/create");

      //tx.reward = (+tx.reward * 1).toString();
      await arweave.transactions.sign(tx);
      const uploader = await arweave.transactions.getUploader(tx);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
          `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }
      if (uploader.txPosted) {
        epObj.audio = tx.id;
        epObj.type = fileType;
        epObj.audioTxByteSize = data.size;
        this.uploadShow(epObj);
        event.target.reset();
        swal(
          "Upload complete",
          "Episode uploaded permanently to Arweave. Check in a few minutes after the transaction has mined.",
          "success"
        );
        this.setState({ showUploadFee: null });
      } else {
        swal(
          "Upload failed",
          "Check your AR balance and network connection",
          "error"
        );
      }
    }
  };
  
    handleEpisodeUpload = async (event) => {
      this.setState({episodeUploading: true})
      swal('Upload underway...', "We'll let you know when it's done. Go grab a ☕ or 🍺")
       let epObj = {}
       event.preventDefault()
        epObj.name = event.target.episodeName.value
        epObj.desc = event.target.episodeShowNotes.value
        epObj.index = this.props.podcast.index
        epObj.verto = event.target.verto.value
        let episodeFile = event.target.episodeMedia.files[0]
        let fileType = episodeFile.type
        console.log(fileType)
        this.processFile(episodeFile).then((file) => {
           this.uploadToArweave(file, fileType, epObj, event)
       })
       this.setState({episodeUploading: false})
       }

      getSwcId = async () => {
        let tx
        const addr = await window.arweaveWallet.getActiveAddress()
        if (!addr) { return null } else {
        tx = await ardb.search('transactions')
        .from(addr)
        .tag('App-Name', 'SmartWeaveAction')
        .tag('Action', 'launchCreator')
        .tag('Protocol', 'permacast-testnet-v3')
        .tag('Contract-Src', CONTRACT_SRC)
        .find()
        }
        return tx[0]['node']['id']
      }

    uploadShow = async (show) => {
        let theContractId
         theContractId = await this.getSwcId()
         console.log(theContractId)
        console.log(show)
        let input = {
          'function': 'addEpisode',
          'index': this.props.podcast.index,
          'name': show.name,
          'desc': show.desc,
          'audio': show.audio,
          'audioTxByteSize': show.audioTxByteSize,
          'type': show.type
        }

        console.log(input)
  
        let tags = { "Contract-Src": CONTRACT_SRC, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain" }
        let txId = await interactWrite(arweave, "use_wallet", theContractId, input, tags)
        console.log(txId)
        if (show.verto) {
          this.listEpisodeOnVerto(txId)
        }
      }
    
      toFixed(x) {
        if (Math.abs(x) < 1.0) {
          var e = parseInt(x.toString().split('e-')[1]);
          if (e) {
              x *= Math.pow(10,e-1);
              x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
          }
        } else {
          e = parseInt(x.toString().split('+')[1]);
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
                    <Form.Control required pattern=".{3,50}" title="Between 3 and 50 characters" type="text" name="episodeName" placeholder="EP1: Introduction" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="episodeShowNotes">
                    <Form.Label>Episode description</Form.Label>
                    <Form.Control required maxlength="250" as="textarea" name="episodeShowNotes" placeholder="In this episode..." rows={3} />
                </Form.Group>
                <Form.Group className="mb-5" controlId="episodeMedia">
                <Form.Label>Audio file</Form.Label>
                <Form.Control className="audio-input" required type="file" onChange={(e) => this.calculateUploadFee(e.target.files[0])} name="episodeMedia"/>
                </Form.Group>
                <Form.Group className="mt-5 mb-3" controlId="verto">
                  <Form.Check label="List as an Atomic NFT on Verto?" id="verto"/>
                </Form.Group>
                {this.state.showUploadFee ? <p className="text-gray p-3">~${this.state.showUploadFee} to upload</p> : null }
                <br/><br/>
                {!this.state.episodeUploading ? 
                <Button
                  type="submit"
                  variant="success"
                  color="default"
                  component="span"
                >
                  Upload
                </Button>
                :
                <Button
                  disabled
                  type="submit"
                  variant="success"
                  color="default"
                  component="span"
                >
                  Uploading, please wait...
                </Button>
                }
                </Form>
            </Card>
            </Col>
            </Container>
            </div>
        )
    }

}
