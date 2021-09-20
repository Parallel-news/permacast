import { React, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { interactWrite } from 'smartweave'
import ArDB from 'ardb';
import swal from 'sweetalert';
import { CONTRACT_SRC, arweave } from '../utils/arweave.js'

const ardb = new ArDB(arweave)

export default function UploadShow()  {
    let finalShowObj = {} 
    const [show, setShow] = useState(false);

    const deployContract = async () => {
      const initialState = `{"podcasts": []}`
      const tx = await arweave.createTransaction({data: initialState})
    
      tx.addTag("Protocol", "permacast-testnet-v3")
      tx.addTag("Action", "launchCreator")
      tx.addTag("App-Name", "SmartWeaveAction")
      tx.addTag("App-Version", "0.3.0")
      tx.addTag("Contract-Src", CONTRACT_SRC)
      tx.addTag("Content-Type", "application/json")
      tx.addTag("Timestamp", Date.now())
    
      await arweave.transactions.sign(tx)
      await arweave.transactions.post(tx)
      console.log(tx)
      return tx.id
    }
    
    const handleUploadClick = () => {
        setShow(true);
      };
    
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
      let contractId
      let tx
      const addr = await window.arweaveWallet.getActiveAddress()
      console.log(addr)
      if (!addr) { return null } else {
      tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveAction')
      .tag('Action', 'launchCreator')
      .tag('Protocol', 'permacast-testnet-v3')
      .tag('Contract-Src', CONTRACT_SRC)
      .find()
      }
      console.log(tx)
      if (tx.length !==0) {
        contractId = tx[0].node.id
      }
      if (!contractId) {
        console.log('not contractId - deploying new contract')
        contractId = await deployContract()
      }
      let input = {
        'function': 'createPodcast',
        'name': show.name,
        'desc': show.desc,
        'cover': show.cover
      }

      let tags = { "Contract-Src": contractId, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "application/json" }
      let uploadTxId = await interactWrite(arweave, "use_wallet", contractId, input, tags)
      if (uploadTxId) {
        console.log(uploadTxId)
      } else {
        alert('An error occured.')
      }
    }

    const uploadToArweave = async (data, fileType, showObj) => {
      console.log('made it here, data is')
      console.log(data)
        arweave.createTransaction({ data: data } ).then((tx) => {
          tx.addTag("Content-Type", fileType);
          tx.reward = (+tx.reward * 1).toString();
          console.log('created')
          arweave.transactions.sign(tx).then(() => {
            console.log('signed')
            arweave.transactions.post(tx).then((response) => {
              console.log(response)
              if (response.statusText === "OK") {
                showObj.cover = tx.id
                finalShowObj = showObj;
                console.log(finalShowObj)
                uploadShow(finalShowObj)
                setShow(false)
                swal('Show added', 'Show added permanently to Arweave. Check in a few minutes after the transaction has mined.', 'success')
              } else {
                swal('Unable to add show', 'Check your wallet balance and network connection', 'danger')
              }
            });
          });
        });
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
        <span className="">
            <Button variant="outline-primary" onClick={() => handleUploadClick()}>Upload</Button>
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
      </Modal>
      </>
    )
}