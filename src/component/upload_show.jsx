import { React, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Arweave from 'arweave'

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 100000,
  logging: false,
});


export default function PodcastHtml()  {

    const [show, setShow] = useState(false);

    const handleUploadClick = () => {
        setShow(true);
      };

    const readFile = async (e) => {
      //e.preventDefault()
      const reader = new FileReader()
      reader.onload = async (e) => { 
        const file = (e.target.result)
        return file
      };
      reader.readAsArrayBuffer(e.target.files[0])
    }

     const uploadToArweave = (file) => {
      const wallet = JSON.parse(sessionStorage.getItem("arweaveWallet"));
      const data = readFile(file)
      console.log(data)
      if (!wallet) { return null } else {
        arweave.createTransaction({ data: data }, wallet).then((tx) => {
          tx.addTag("Content-Type", data.type);
          arweave.transactions.sign(tx, wallet).then(() => {
            arweave.transactions.post(tx, wallet).then((response) => {
              console.log(response)
              if (response.statusText === "OK") {
                console.log(response.statusText)
              }
            });
          });
        });
      }
    }

    const handleShowUpload = (event) => {
      event.preventDefault()
      const podcastName = event.target.podcastName.value
      const podcastDescription = event.target.podcastDescription.value
      const podcastCover = event.target.podcastCover.files[0]
      console.log(podcastCover)
      const podcastCoverTxId = uploadToArweave(podcastCover)
      const showObj = {
        "name" : podcastName,
        "desc" : podcastDescription,
        "cover" : podcastCoverTxId
      }
      console.log(showObj);
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
          <Form onSubmit={handleShowUpload}>
            <Form.Group className="mb-3" controlId="podcastName">
              <Form.Label>Show name</Form.Label>
              <Form.Control type="text" name="podcastName" placeholder="The Arweave Show" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="podcastDescription">
              <Form.Label>Show description</Form.Label>
              <Form.Control as="textarea" name="podcastDescription" placeholder="This is a show about..." rows={3} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="podcastCover" />
              <Form.Label>Cover image</Form.Label>
              <Form.Control type="file" onChange={(e) => readFile(e)} name="podcastCover"/>
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