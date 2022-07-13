
import ArDB from 'ardb';
import Swal from 'sweetalert2';
import { Fragment, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Transition, Dialog } from '@headlessui/react';
import { FiFile } from 'react-icons/fi';
import { appContext } from '../utils/initStateGen';
import { UploadIcon } from '@heroicons/react/outline';
import { CONTRACT_SRC, NFT_SRC, FEE_MULTIPLIER, arweave, smartweave, EPISODE_UPLOAD_FEE_PERCENTAGE, TREASURY_ADDRESS } from '../utils/arweave.js';
import { processFile, calculateStorageFee, fetchWalletAddress, userHasEnoughAR } from '../utils/shorthands.js';

const ardb = new ArDB(arweave);


export function Modal(props) {
  const { t } = useTranslation();
  const appState = useContext(appContext);
  const {isOpen, setIsOpen} = appState.globalModal;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10 " open={isOpen} onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 transition-all">
                {props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default function UploadEpisode({ podcast }) {
  const { t } = useTranslation()
  const appState = useContext(appContext);
  const {isOpen, setIsOpen} = appState.globalModal;
  const [episodeFileName, setEpisodeFileName] = useState(null);
  const [episodeUploadFee, setEpisodeUploadFee] = useState(0)
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

  const uploadToArweave = async (data, fileType, epObj, event, serviceFee) => {
    const wallet = await fetchWalletAddress() // window.arweaveWallet.getActiveAddress();
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
      tx.addTag("Permacast-Version", "amber");
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
        const newTx = await arweave.createTransaction({target:TREASURY_ADDRESS, quantity: arweave.ar.arToWinston('' + serviceFee)})
        console.log(newTx)
        await arweave.transactions.sign(newTx)
        console.log(newTx)
        await arweave.transactions.post(newTx)
        console.log(newTx.response)
        epObj.content = tx.id;

        console.log('txPosted:')
        console.log(epObj)
        uploadShow(epObj);
        event.target.reset();
        setIsOpen(false)
        Swal.fire({
          title: t("uploadepisode.swal.uploadcomplete.title"),
          text: t("uploadepisode.swal.uploadcomplete.text"),
          icon: "success",
          customClass: "font-mono",
        });
        setEpisodeUploadFee(null);
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
      let epObjSize = JSON.stringify(epObj).length;
      let bytes = file.byteLength + epObjSize + fileType.length;
      calculateStorageFee(bytes).then((cost) => {
        const serviceFee = cost / EPISODE_UPLOAD_FEE_PERCENTAGE;
        userHasEnoughAR(t, bytes, serviceFee).then((result) => {
          if (result === "all good") {
            console.log('Fee cost: ' + (serviceFee))
            uploadToArweave(file, fileType, epObj, event, serviceFee)
          } else console.log('upload failed');
        })
      })
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
    let tags = { "Contract": contract, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain", "Input": JSON.stringify(input), "Permacast-Version": "amber" }
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

  const onFileUpload = async(file) => {
    if (file) {
      setEpisodeFileName(file?.name)
      const uploadPrice = await calculateStorageFee(file?.byteLength);
      const serviceFee = uploadPrice / EPISODE_UPLOAD_FEE_PERCENTAGE;
      const totalFee = uploadPrice + serviceFee
      setEpisodeUploadFee(totalFee)
    }
  }

  return (
    <Modal>
      <div className="bg-zinc-900" data-theme="permacast">
        <div className="relative mt-6 mb-3">
          <div className="font-semibold">
            Add Episode
          </div>
          <div className="absolute text-2xl right-10 btn btn-sm btn-ghost top-[-6px]" onClick={() => setIsOpen(false)}>
            ×
          </div>
        </div>
        <div className="flex items-center justify-center flex-col rounded-xl">
          <div className="py-6 px-10 w-full form-control">
            <form className="" onSubmit={handleEpisodeUpload}>
              <div className="mb-5">
                <input className="input input-secondary w-full py-3 px-5 bg-zinc-800 border-0 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" required pattern=".{3,500}" title="Between 3 and 500 characters" type="text" name="episodeName" placeholder="Episode title..." />
              </div>
              <div className="mb-5">
                <textarea className="input input-secondary resize-none w-full h-28 pb-12 py-3 px-5 bg-zinc-800 border-0 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" required pattern=".{1,5000}" title="Between 1 and 5000 characters" type="text" name="episodeShowNotes" placeholder="Episode description..."></textarea>
              </div>
              <div className="mb-5 bg-zinc-800 rounded-xl cursor-pointer">
                <input className="opacity-0 absolute z-[-1]" id="file" required type="file" onChange={(e) => onFileUpload(e.target.files?.[0])} name="episodeMedia" />
                <label htmlFor="file" className="flex items-center text-zinc-400 transition duration-300 ease-in-out hover:text-white my-4 py-6 px-3 w-full cursor-pointer">
                  <FiFile className="w-7 h-6 cursor-pointer rounded-lg mx-2" />
                  <div>
                    {episodeFileName ? episodeFileName : "Episode Media"}
                  </div>
                </label>
              </div>
              {uploadProgress && (
                <>
                  <div className="text-xl text-white">{t("uploadepisode.uploaded")}</div>
                  <progress className="progress-primary mt-3" value={uploadPercentComplete} max="100"></progress>
                </>
              )}
              <div className="bg-zinc-700 rounded-lg p-4">
                {t("uploadshow.feeText")}
                <span className="text-lg font-bold underline">{(episodeUploadFee).toFixed(3)} AR</span>
              </div>
              {episodeUploadFee ? (
                <div className="w-80">
                  <p className="text-gray py-3">{episodeUploadFee} {t("uploadepisode.toupload")}</p>
                  <div className="bg-zinc-800 rounded-lg w-full">
                    {t("uploadepisode.feeText")}
                    <span className="text-lg font-bold underline">
                      {(episodeUploadFee / EPISODE_UPLOAD_FEE_PERCENTAGE).toFixed(3)} AR
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="mt-8 flex items-center justify-between text-zinc-200">
                <label className="cursor-pointer label flex justify-start">
                  <input className="checkbox checkbox-primary mx-2" type="checkbox" id="verto" />
                  <span className="label-text transition duration-300 ease-in-out hover:text-white">{t("uploadepisode.verto")}</span>
                </label>
                {!episodeUploading ?
                  <button
                    className="btn btn-secondary bg-zinc-800 hover:bg-zinc-600 transition duration-300 ease-in-out hover:text-white rounded-xl px-8"
                    type="submit"
                  >
                    <UploadIcon className="h-5 w-5 mr-2" />
                    {t("uploadepisode.upload")}
                  </button>
                  :
                  <button
                    className="btn btn-outline rounded-xl"
                    disabled
                    type="submit"
                  >
                    {t("uploadepisode.uploading")}
                  </button>
                }
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
