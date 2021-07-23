import { React, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function PodcastHtml()  {

    const [show, setShow] = useState(false);

    const handleUpload = () => {
        setShow(true);
      };

    const handleClose = () => {
        setShow(false);
    }

    return(  
        <>  
        <span className="mr-2 ml-2">
            <Button onClick={handleUpload}>Upload</Button>
        </span> 
        <Modal
        show={show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Modal.Title className="p-4" id="alert-dialog-title">
          {"Add a new show"}
          <br></br>
        </Modal.Title>
        <Modal.Body className="m-2">
        
        <br/><br/>
        </Modal.Body>
        <Modal.Footer className="m-2">
        <Button variant="danger" onClick={handleClose} color="danger">
            Cancel)
          </Button>
        <Button
              variant="success"
              color="default"
              component="span"
            >
              Upload
            </Button>
          
        </Modal.Footer>
      </Modal>
      </>
    )
}