import { React, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Arweave from 'arweave'
import { readContract, interactWrite, interactWriteDryRun, createContractFromTx } from 'smartweave'
import ArDB from 'ardb';

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});

const ardb = new ArDB(arweave)
const masterContract = "mvBG00Ccigq9htgOVCdAe9vXM8efbGzm8ax89NIlZS8"

export default function UploadShow()  {
    let finalShowObj = {} 
    const [show, setShow] = useState(false);

    async function deployContract() {
      const initialState = `{"podcasts": {}}`
      const jwk = sessionStorage.getItem('arweaveWallet')
      const tx = await arweave.createTransaction({data: initialState}, jwk)
    
      tx.addTag("Protocol", "permacast-testnet")
      tx.addTag("Action", "launchCreator")
      tx.addTag("App-Name", "SmartWeaveContract")
      tx.addTag("App-Version", "0.3.0")
      tx.addTag("Contract-Src", "mvBG00Ccigq9htgOVCdAe9vXM8efbGzm8ax89NIlZS8")
      tx.addTag("Content-Type", "application/json")
      tx.addTag("Timestamp", Date.now())
    
      await arweave.transactions.sign(tx, jwk)
      await arweave.transactions.post(tx)
      console.log(tx)
      console.log(`transaction's ID is: ${tx.id}`)
    }
    

    const handleUploadClick = () => {
        setShow(true);
      };

    const findUserSwc = async () => {
      const addr = sessionStorage.getItem("wallet_address");
      let tx
      if (!addr) { return null } else {
      ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'permacast')
      .tag('App-Function', 'createOwner')
      .find()
      .then((txs) => {
        if(txs) {
        tx = txs
        } else {
          return null
        }
        return tx
        // find the SWC ID in the tx, save to localStorage 'swcId'
      }
      )
    }
  }

    async function getSwcId() {
      let id;
      if (localStorage.getItem('swcId')) {
        id = localStorage.getItem('swcId')
      } else {
        console.log('hit else in getSwcId')
        id = await findUserSwc()
      }
      return id
    }

    function readFileAsync(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      })
    }

    async function processFile(file) {
      try {
        let contentBuffer = await readFileAsync(file);
        return contentBuffer
      } catch(err) {
        console.log(err);
      }
    }

    const uploadShow = async (show) => {



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

    const uploadToArweave = async (data, fileType, showObj) => {
      const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"))
      if (!wallet) { return null } else {
        arweave.createTransaction({ data: data }, wallet).then((tx) => {
          tx.addTag("Content-Type", fileType);
          arweave.transactions.sign(tx, wallet).then(() => {
            arweave.transactions.post(tx, wallet).then((response) => {
              if (response.statusText === "OK") {
                showObj.cover = tx.id
                finalShowObj = showObj;
                console.log(finalShowObj)
                uploadShow(finalShowObj)
              }
            });
          });
        });
      }
    }

    const handleShowUpload = async (event) => {
      const showObj = {}
      event.preventDefault()
      const podcastName = event.target.podcastName.value
      const podcastDescription = event.target.podcastDescription.value
      const podcastCover = event.target.podcastCover.files[0]
      const coverFileType = podcastCover.type
      showObj.name = podcastName
      showObj.desc = podcastDescription
      let cover = await processFile(podcastCover)
      await uploadToArweave(cover, coverFileType, showObj)
   }

    const handleClose = () => {
        setShow(false);
    }

    return(  
        <>  
        <span className="mr-2 ml-2">
            <Button onClick={() => handleUploadClick()}>Upload</Button>
        </span> 
        <Modal
        show={show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Modal.Title className="p-4" id="alert-dialog-title">
          {"Add a new show"}
          <br/>
          <small className="font-small font-italics">{"You'll add episodes to the show next."}</small>
          <br/>
        </Modal.Title>
        <Modal.Body className="m-2">
          <Form hasValidation onSubmit={handleShowUpload}>
            <Form.Group className="mb-3" controlId="podcastName">
              <Form.Label>Show name</Form.Label>
              <Form.Control required type="text" name="podcastName" placeholder="The Arweave Show" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="podcastDescription">
              <Form.Label>Show description</Form.Label>
              <Form.Control required as="textarea" name="podcastDescription" placeholder="This is a show about..." rows={3} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="podcastCover" />
              <Form.Label>Cover image</Form.Label>
              <Form.Control required type="file" /*onChange={(e) => readFile(e.target.files[0])*/ name="podcastCover"/>
        <br/><br/>
        <Modal.Footer className="m-2">
        <Button variant="danger" onClick={handleClose} color="danger">
            Cancel
          </Button>
        <Button
              type="submit"
              variant="success"
              color="default"
              component="span"
            >
              Upload
            </Button>
        </Modal.Footer>
        </Form>
        </Modal.Body>
        <Button onClick={deployContract}>Deploy</Button>
      </Modal>
      </>
    )
}