import React, { useState } from "react";

import swal from 'sweetalert';
import { arweave } from "../utils/arweave.js"

export default function WalletLoader() {

  const [show, setShow] = useState(false);
  let fileReader;

  const handleClickOpen = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleDisconnect = () => {
    sessionStorage.clear()
    window.location.reload(false)
  }

  const handleFileRead = (e) => {
    const content = fileReader.result;
    try {
      var wallet_file = JSON.parse(content);
      arweave.wallets.jwkToAddress(wallet_file).then((address) => {
        console.log(address)
        sessionStorage.setItem("wallet_address", address);
      });
      sessionStorage.setItem("arweaveWallet", content);
    } catch (err) {
      swal({ title: "Invalid wallet file", text: "That doesn't look like a valid Arweave wallet - please try again", icon: "error" })
    }
  };

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
    setShow(false)
    window.location.reload(false)
  };

  return (
    <div>
      {sessionStorage.getItem("arweaveWallet") ?
        <div className="btn btn-outline btn-warning" onClick={handleDisconnect}>
          Disconnect wallet
        </div>
        :
        <div className="btn btn-outline btn-success" onClick={handleClickOpen}>
          Login with Arweave
        </div>
      }
      <div
        show={show}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="p-4" id="alert-dialog-title">
          {"Login with Arweave"}
          <br></br>
        </div>
        <div className="m-2">
          Connect your Arweave wallet to use this app. Visit {" "}
          <a href="https://arweave.org">Arweave</a> to create a
          wallet.
          <br /><br />
          <input
            className=""
            id="raised-button-file"
            onChange={(e) => handleFileChosen(e.target.files[0])}
            type="file"
          />
        </div>
        <div className="m-2">
          <div className="btn btn-warning" onClick={handleClose}>
            Cancel
          </div>
          <div
            className="btn"
            component="span"
          >
            Upload
          </div>

        </div>
      </div>
    </div>
  );
}