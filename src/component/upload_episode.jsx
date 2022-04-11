import ArDB from 'ardb'
import Swal from 'sweetalert2'
import { CONTRACT_SRC, NFT_SRC, FEE_MULTIPLIER, arweave, smartweave } from '../utils/arweave.js'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ardb = new ArDB(arweave)

export default function UploadEpisode({ podcast }) {
  const { t } = useTranslation()
  const [showUploadFee, setShowUploadFee] = useState(null)
  const [episodeUploading, setEpisodeUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [uploadPercentComplete, setUploadPercentComplete] = useState(0)

  const listEpisodeOnVerto = async (episodeId) => {
    const vertoContractId = 't9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE';
    const input = {
      "function": "list",
      "id": episodeId,
      "type": "art"
    };
    const contract = smartweave.contract(vertoContractId).connect('use_wallet');
    await contract.writeInteraction(input);
  }

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    })
  }

  const processFile = async (file) => {
    try {
      let contentBuffer = await readFileAsync(file);
      console.log(contentBuffer)
      return contentBuffer
    } catch (err) {
      console.log(err);
    }
  }

  const uploadToArweave = async (data, fileType, epObj, event) => {
    const wallet = await window.arweaveWallet.getActiveAddress();
    console.log(wallet);
    if (!wallet) {
      return null;
    } else {
      const tx = await arweave.createTransaction({ data: data });
      const initState = `{"issuer": "${wallet}","owner": "${wallet}","name": "${epObj.name}","ticker": "PANFT","description": "${epObj.desc}","thumbnail": "${podcast.cover}","balances": {"${wallet}": 1}}`;
      tx.addTag("Content-Type", fileType);
      tx.addTag("App-Name", "SmartWeaveContract");
      tx.addTag("App-Version", "0.3.0");
      tx.addTag("Contract-Src", NFT_SRC);
      tx.addTag("Init-State", initState);
      // Verto aNFT listing
      tx.addTag("Exchange", "Verto");
      tx.addTag("Action", "marketplace/create");
      tx.addTag("Thumbnail", podcast.cover);
     
      tx.reward = (+tx.reward * FEE_MULTIPLIER).toString();
      
      await arweave.transactions.sign(tx);
      console.log("signed tx", tx);
      const uploader = await arweave.transactions.getUploader(tx);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();

        setUploadProgress(true)
        setUploadPercentComplete(uploader.pctComplete)

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
        uploadShow(epObj);
        event.target.reset();
        Swal.fire({
          title: t("uploadepisode.swal.uploadcomplete.title"),
          text: t("uploadepisode.swal.uploadcomplete.text"),
          icon: "success",
          customClass: "font-mono",
        });
        setShowUploadFee(null);
      } else {
        Swal.fire(
          {
            title: t("uploadepisode.swal.uploadfailed.title"),
            text: t("uploadepisode.swal.uploadfailed.text"),
            icon: "error",
            customClass: "font-mono",
          }
        );
      }
    }
  };

  const handleEpisodeUpload = async (event) => {
    setEpisodeUploading(true)
    Swal.fire({
      title: t("uploadepisode.swal.upload.title"),
      text: t("uploadepisode.swal.upload.text"),
      customClass: "font-mono",
    })
    let epObj = {}
    event.preventDefault()
    epObj.name = event.target.episodeName.value
    epObj.desc = event.target.episodeShowNotes.value
    epObj.index = podcast.index
    epObj.verto = event.target.verto.checked
    let episodeFile = event.target.episodeMedia.files[0]
    let fileType = episodeFile.type
    console.log(fileType)
    processFile(episodeFile).then((file) => {
      uploadToArweave(file, fileType, epObj, event)
    })
    setEpisodeUploading(false)
  }


  // const getAddrRetry = async () => {
  //   await window.arweaveWallet.connect(['ACCESS_ADDRESS'])
  //   let addr = window.arweaveWallet.getActiveAddress();
  //   while (!addr) {
  //     if (addr) {
  //       return addr;
  //     } else {
  //       //
  //     }
  //   }
  // }

  const getSwcId = async () => {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
    let addr = await window.arweaveWallet.getActiveAddress() //await getAddrRetry() 
    if (!addr) {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
      addr = await window.arweaveWallet.getActiveAddress()
    }
    const tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveAction')
      .tag('Action', 'launchCreator')
      .tag('Protocol', 'permacast-testnet-v3')
      .tag('Contract-Src', CONTRACT_SRC)
      .find()


    if (!tx || tx.length === 0) {
      Swal.fire(
        {
          title: 'Something went wrong :( please retry the upload',
          customClass: "font-mono",
        }
      );
    } else {
      console.log("tx", tx)
      return tx[0].id
    }
  }

  const uploadShow = async (show) => {
    const theContractId = await getSwcId()
    console.log("theContractId", theContractId)
    console.log("show", show)
    let input = {
      'function': 'addEpisode',
      'index': podcast.index,
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
      await listEpisodeOnVerto(txId)
    } else {
      console.log('skipping Verto')
    }
  }

  // const toFixed = (x) => {
  //   if (Math.abs(x) < 1.0) {
  //     var e = parseInt(x.toString().split('e-')[1]);
  //     if (e) {
  //       x *= Math.pow(10, e - 1);
  //       x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
  //     }
  //   } else {
  //     e = parseInt(x.toString().split('+')[1]);
  //     if (e > 20) {
  //       e -= 20;
  //       x /= Math.pow(10, e);
  //       x += (new Array(e + 1)).join('0');
  //     }
  //   }
  //   return x;
  // }

  const calculateUploadFee = (file) => {
    console.log('fee reached')
    const fee = 0.0124 * ((file.size / 1024 / 1024) * 3).toFixed(4)
    setShowUploadFee(fee)
  }

  return (
    <div className="flex items-center justify-center shadow-md flex-col mb-10 px-10 rounded-xl">
      <div className="label block uppercase text-center">{t("uploadepisode.title")} {podcast?.podcastName}</div>
      <div className="form-control">
        <form className="p-4" onSubmit={handleEpisodeUpload}>
          <div className="mb-3">
            <span className="label label-text">{t("uploadepisode.name")}</span>
            <input className="input input-bordered" required pattern=".{3,50}" title="Between 3 and 50 characters" type="text" name="episodeName" placeholder="EP1: Introduction" />
          </div>
          <div className="mb-3">
            <span className="label label-text">{t("uploadepisode.description")}</span>
            <input className="input input-bordered" required maxLength="250" as="textarea" name="episodeShowNotes" placeholder="In this episode..." rows={3} />
          </div>
          <div className="mb-5">
            <span className="label label-text">{t("uploadepisode.file")}</span>
            <input required type="file" onChange={(e) => calculateUploadFee(e.target.files[0])} name="episodeMedia" />
          </div>
          <div className="mt-5">
            <label className="cursor-pointer label flex justify-start mt-3">
              <input className="checkbox checkbox-primary mx-2" type="checkbox" id="verto" />
              <span className="label-text">{t("uploadepisode.verto")}</span>
            </label>


          </div>
          {showUploadFee ? <p className="text-gray p-3">~${showUploadFee} {t("uploadepisode.toupload")}</p> : null}
          <br /><br />
          {!episodeUploading ?
            <button
              className="btn btn-primary"
              type="submit"
            >
              {t("uploadepisode.upload")}
            </button>
            :
            <button
              className="btn btn-outline"
              disabled
              type="submit"
            >
              {t("uploadepisode.uploading")}
            </button>
          }
          {uploadProgress && <div className="mt-3">{t("uploadepisode.uploaded")} {uploadPercentComplete}%</div>}
        </form>
      </div>
    </div>
  )
}
