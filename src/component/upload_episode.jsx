import ArDB from 'ardb'
import Swal from 'sweetalert2'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTRACT_SRC, NFT_SRC, FEE_MULTIPLIER, arweave, smartweave } from '../utils/arweave.js'
import { processFile, userHasEnoughAR } from '../utils/shorthands.js';

const ardb = new ArDB(arweave)

export default function UploadEpisode({ podcast }) {
  console.log(podcast)
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

  const uploadToArweave = async (data, fileType, epObj, event) => { 
    const wallet = await window.arweaveWallet.getActiveAddress();
    console.log(wallet);
    if (!wallet) {
      return null;
    } else {
      const tx = await arweave.createTransaction({ data: data });
      const initState = `{"issuer": "${wallet}","owner": "${wallet}","name": "${epObj.name}","ticker": "PANFT","description": "Permacast Episode from ${epObj.name}","thumbnail": "${podcast.cover}","balances": {"${wallet}": 1}}`;
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
      }
      if (uploader.txPosted) {
        epObj.content = tx.id;

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
    event.preventDefault();

    epObj.name = event.target.episodeName.value
    epObj.desc = event.target.episodeShowNotes.value
    epObj.index = podcast.index
    epObj.verto = event.target.verto.checked
    let episodeFile = event.target.episodeMedia.files[0]
    let fileType = episodeFile.type
    console.log(fileType)
    processFile(episodeFile).then((file) => {
      let epObjSize = JSON.stringify(epObj).length
      let bytes = file.byteLength + epObjSize + fileType.length
      if (userHasEnoughAR(t, bytes) === "all good") {
        uploadToArweave(file, fileType, epObj, event)
      }
    })
    setEpisodeUploading(false)
  }


  const getSwcId = async () => {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
    let addr = await window.arweaveWallet.getActiveAddress() //await getAddrRetry() 
    if (!addr) {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
      addr = await window.arweaveWallet.getActiveAddress()
    }
    const tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveContract')
      .tag('Permacast-Version', 'amber')
      .tag('Contract-Src', CONTRACT_SRC)
      .find()


    if (!tx || tx.length === 0) {
      Swal.fire(
        {
          title: 'Insuffucient balance or Arweave gateways are unstable. Please try again later',
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
      'pid': podcast.pid,
      'name': show.name,
      'desc': true,
      'content': show.content
    }

    console.log(input)
    const contract = podcast?.newChildOf ? podcast.newChildOf : podcast.childOf;
    console.log("CONTRACT CHILDOF")
    console.log(contract)
    let tags = { "Contract": contract, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain", "Input": JSON.stringify(input) }
    // let contract = smartweave.contract(theContractId).connect("use_wallet");
    // let txId = await contract.writeInteraction(input, tags);
    const interaction = await arweave.createTransaction({data: show.desc});

    for (let key in tags) {
      interaction.addTag(key, tags[key]);
    }
    
    interaction.reward = (+interaction.reward * FEE_MULTIPLIER).toString();

    await arweave.transactions.sign(interaction);
    await arweave.transactions.post(interaction);
    console.log('addEpisode txid:');
    console.log(interaction.id)
    if (show.verto) {
      console.log('pushing to Verto')
      await listEpisodeOnVerto(interaction.id)
    } else {
      console.log('skipping Verto')
    }
  }


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
            <input className="input input-bordered" required pattern=".{3,500}" title="Between 3 and 500 characters" type="text" name="episodeName" placeholder="EP1: Introduction" />
          </div>
          <div className="mb-3">
            <span className="label label-text">{t("uploadepisode.description")}</span>
            <input className="input input-bordered" required pattern=".{1,5000}" title="Between 1 and 5000 characters" type="text" name="episodeShowNotes" placeholder="In this episode..." rows={3} />
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
