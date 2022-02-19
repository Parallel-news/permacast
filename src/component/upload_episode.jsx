import { React, Component } from 'react'
import ArDB from 'ardb'
import Swal from 'sweetalert2'
import { CONTRACT_SRC, NFT_SRC, arweave, smartweave } from '../utils/arweave.js'

const ardb = new ArDB(arweave)

export default class UploadEpisode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episodeUploading: false
    }
  }

  listEpisodeOnVerto = async (episodeId) => {
    const vertoContractId = 't9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE';
    const input = {
      "function": "list",
      "id": episodeId,
      "type": "art"
    };
    const contract = smartweave.contract(vertoContractId).connect('use_wallet');
    await contract.writeInteraction(input);
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
    } catch (err) {
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
      const initState = `{"issuer": "${wallet}","owner": "${wallet}","name": "${epObj.name}","ticker": "PANFT","description": "${epObj.desc}","thumbnail": "${this.props.podcast.cover}","balances": {"${wallet}": 1}}`;
      tx.addTag("Content-Type", fileType);
      tx.addTag("App-Name", "SmartWeaveContract");
      tx.addTag("App-Version", "0.3.0");
      tx.addTag("Contract-Src", NFT_SRC);
      tx.addTag("Init-State", initState);
      // Verto aNFT listing
      tx.addTag("Exchange", "Verto");
      tx.addTag("Action", "marketplace/create");
      tx.addTag("Thumbnail", this.props.podcast.cover);

      await arweave.transactions.sign(tx);
      console.log(tx);
      const uploader = await arweave.transactions.getUploader(tx);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();

        this.setState({ uploadProgress: true })
        this.setState({ uploadPercentComplete: uploader.pctComplete })

        console.log(
          //  `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }
      if (uploader.txPosted) {
        epObj.audio = tx.id;
        epObj.type = fileType;
        epObj.audioTxByteSize = data.size;
        console.log('txPosted:')
        console.log(epObj)
        this.uploadShow(epObj);
        event.target.reset();
        Swal.fire({
          title: "Upload complete",
          text: "Episode uploaded permanently to Arweave. Check in a few minutes after the transaction has mined.",
          icon: "success",
          customClass: "font-mono",
        });
        this.setState({ showUploadFee: null });
      } else {
        Swal.fire(
          {
            title: "Upload failed",
            text: "Check your AR balance and network connection",
            icon: "error",
            customClass: "font-mono",
          }
        );
      }
    }
  };

  handleEpisodeUpload = async (event) => {
    this.setState({ episodeUploading: true })
    Swal.fire({
      title: `Upload underway!`,
      text: "We'll let you know when it's done. Go grab a ☕ or 🍺",
      customClass: "font-mono",
    })
    let epObj = {}
    event.preventDefault()
    epObj.name = event.target.episodeName.value
    epObj.desc = event.target.episodeShowNotes.value
    epObj.index = this.props.podcast.index
    epObj.verto = event.target.verto.checked
    let episodeFile = event.target.episodeMedia.files[0]
    let fileType = episodeFile.type
    console.log(fileType)
    this.processFile(episodeFile).then((file) => {
      this.uploadToArweave(file, fileType, epObj, event)
    })
    this.setState({ episodeUploading: false })
  }


  getAddrRetry = async () => {
    await window.arweaveWallet.connect(['ACCESS_ADDRESS'])
    let addr = window.arweaveWallet.getActiveAddress();
    while (!addr) {
      if (addr) {
        return addr;
      } else {
        //
      }
    }
  }

  getSwcId = async () => {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
    let tx
    let addr = await window.arweaveWallet.getActiveAddress() //await this.getAddrRetry() //
    if (!addr) {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
      addr = await window.arweaveWallet.getActiveAddress()
    }
    tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveAction')
      .tag('Action', 'launchCreator')
      .tag('Protocol', 'permacast-testnet-v3')
      .tag('Contract-Src', CONTRACT_SRC)
      .find()

    if (!tx) {
      Swal.fire(
        {
          title: 'Something went wrong :( please retry the upload',
          customClass: "font-mono",
        }
      );
    } else {
      return tx[0].id
    }
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
    let contract = smartweave.contract(theContractId).connect("use_wallet");
    let txId = await contract.writeInteraction(input, tags);
    console.log('addEpisode txid:');
    console.log(txId)
    if (show.verto) {
      console.log('pushing to Verto')
      await this.listEpisodeOnVerto(txId)
    } else {
      console.log('skipping Verto')
    }
  }

  toFixed = (x) => {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += (new Array(e + 1)).join('0');
      }
    }
    return x;
  }

  calculateUploadFee = (file) => {
    console.log('fee reached')
    let fee = 0.0124 * ((file.size / 1024 / 1024) * 3).toFixed(4)
    this.setState({ showUploadFee: fee })
  }

  render() {

    const podcast = this.props.podcast
    const podcastName = podcast.podcastName

    return (
      <div className="flex items-center justify-center shadow-md flex-col mb-10 px-10 rounded-xl">
        <div className="label block uppercase text-center">Add new episode to {podcastName}</div>
        <div className="form-control">
          <form className="p-4" onSubmit={this.handleEpisodeUpload}>
            <div className="mb-3" controlId="podcastName">
              <span className="label label-text">Episode name</span>
              <input className="input input-bordered" required pattern=".{3,50}" title="Between 3 and 50 characters" type="text" name="episodeName" placeholder="EP1: Introduction" />
            </div>
            <div className="mb-3" controlId="episodeShowNotes">
              <span className="label label-text">Episode description</span>
              <input className="input input-bordered" required maxLength="250" as="textarea" name="episodeShowNotes" placeholder="In this episode..." rows={3} />
            </div>
            <div className="mb-5" controlId="episodeMedia">
              <span className="label label-text">Audio file</span>
              <input required type="file" onChange={(e) => this.calculateUploadFee(e.target.files[0])} name="episodeMedia" />
            </div>
            <div className="mt-5" controlId="verto">
              <label className="cursor-pointer label flex justify-start mt-3">
                <input className="checkbox checkbox-primary mx-2" type="checkbox" id="verto" />
                <span className="label-text">List as an Atomic NFT on Verto?</span>
              </label>


            </div>
            {this.state.showUploadFee ? <p className="text-gray p-3">~${this.state.showUploadFee} to upload</p> : null}
            <br /><br />
            {!this.state.episodeUploading ?
              <button
                className="btn btn-primary"
                type="submit"
              >
                Upload
              </button>
              :
              <button
                className="btn btn-outline"
                disabled
                type="submit"
              >
                Uploading, please wait...
              </button>
            }
            {this.state.uploadProgress && <div className="mt-3">Uploaded {this.state.uploadPercentComplete}%</div>}
          </form>
        </div>
      </div>
    )
  }

}
