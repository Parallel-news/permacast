import { React, useState, useRef } from 'react';
import ArDB from 'ardb';
import { CONTRACT_SRC, FEE_MULTIPLIER, arweave, languages_en, languages_zh, categories_en, categories_zh, smartweave } from '../utils/arweave.js'
import { genetateFactoryState } from '../utils/initStateGen.js';
import { processFile, fetchWalletAddress, userHasEnoughAR } from '../utils/shorthands.js';

import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const ardb = new ArDB(arweave)

export default function UploadShow() {

  let finalShowObj = {}
  const [show, setShow] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const podcastCoverRef = useRef()
  const { t, i18n } = useTranslation()
  const languages = i18n.language === 'zh' ? languages_zh : languages_en
  const categories = i18n.language === 'zh' ? categories_zh : categories_en

  const deployContract = async (address) => {

    const initialState = await genetateFactoryState(address);
    console.log(initialState)
    const tx = await arweave.createTransaction({ data: initialState })


    tx.addTag("App-Name", "SmartWeaveContract")
    tx.addTag("App-Version", "0.3.0")
    tx.addTag("Contract-Src", CONTRACT_SRC)
    tx.addTag("Permacast-Version", "amber");
    tx.addTag("Content-Type", "application/json")
    tx.addTag("Timestamp", Date.now())
    
    tx.reward = (+tx.reward * FEE_MULTIPLIER).toString();
    
    await arweave.transactions.sign(tx)
    await arweave.transactions.post(tx)
    console.log(tx)
    return tx.id
  }


  const uploadShow = async (show) => {
    Swal.fire({
      title: t("uploadshow.swal.uploading.title"),
      timer: 2000,
      customClass: "font-mono",
    })
    let contractId
    let addr = await fetchWalletAddress()

    console.log("ADDRESSS")
    console.log(addr)
    const tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveContract')
      .tag('Permacast-Version', 'amber')
      .tag('Contract-Src', CONTRACT_SRC)
      .find();

    console.log(tx)
    if (tx.length !== 0) {
      contractId = tx[0].id
    }
    if (!contractId) {
      console.log('not contractId - deploying new contract')
      contractId = await deployContract(addr)
    }
    let input = {
      'function': 'createPodcast',
      'name': show.name,
      'contentType': 'a',
      'cover': show.cover,
      'lang': show.lang,
      'isExplicit': show.isExplicit,
      'author': show.author,
      'categories': show.category,
      'email': show.email
    }

    console.log(input)
    console.log("CONTRACT ID:")
    console.log(contractId);

    let tags = { "Contract": contractId, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "text/plain", "Input": JSON.stringify(input)};

    const interaction = await arweave.createTransaction({data: show.desc});

    for (const key in tags) {
      interaction.addTag(key, tags[key]);
    }

    interaction.reward = (+interaction.reward * FEE_MULTIPLIER).toString();
    await arweave.transactions.sign(interaction);
    await arweave.transactions.post(interaction);
    if (interaction.id) {
      Swal.fire({
        title: t("uploadshow.swal.showadded.title"),
        text: t("uploadshow.swal.showadded.text"),
        icon: 'success',
        customClass: "font-mono",
      })
      console.log("INTERACTION.ID")
      console.log(interaction.id)
    } else {
      alert('An error occured.')
    }
  }

  const uploadToArweave = async (data, fileType, showObj) => {
    console.log('made it here, data is')
    console.log(data)
    arweave.createTransaction({ data: data }).then((tx) => {
      tx.addTag("Content-Type", fileType);
      tx.reward = (+tx.reward * FEE_MULTIPLIER).toString();
      console.log('created')
      arweave.transactions.sign(tx).then(() => {
        console.log('signed')
        arweave.transactions.post(tx).then((response) => {
          console.log(response)
          if (response.statusText === "OK") {
            arweave.createTransaction({target:"eBYuvy8mlxUsm8JZNTpV6fisNaJt0cEbg-znvPeQ4A0", quantity: arweave.ar.arToWinston('0.25')}).then((tx) => {
              arweave.transactions.sign(tx).then(() => {
                console.log(tx)
                arweave.transactions.post(tx).then((response) => {
                  console.log(response)
                  setIsUploading(false)
                })
              })
            })
            showObj.cover = tx.id
            finalShowObj = showObj;
            console.log(finalShowObj)
            uploadShow(finalShowObj)
            setShow(false)

          } else {
            Swal.fire({
              title: t("uploadshow.swal.uploadfailed.title"),
              text: t("uploadshow.swal.uploadfailed.text"),
              icon: 'danger',
              customClass: "font-mono",
            })
          }
        });
      });
    });
  }

  const resetPodcastCover = () => {
    podcastCoverRef.current.value = ""
    Swal.fire({
      text: t("uploadshow.swal.reset.text"),
      icon: 'warning',
      confirmButtonText: 'Continue',
      customClass: "font-mono",
    })
  }

  const isPodcastCoverSquared = (event) => {
    if (event.target.files.length !== 0) {
      const podcastCoverImage = new Image()
      podcastCoverImage.src = window.URL.createObjectURL(event.target.files[0])
      podcastCoverImage.onload = () => {
        if (podcastCoverImage.width !== podcastCoverImage.height) {
          resetPodcastCover()
        }
      }
    }
  }

  const handleShowUpload = async (event) => {

    event.preventDefault()
    // extract attrs from form
    const showObj = {}
    const podcastName = event.target.podcastName.value
    const podcastDescription = event.target.podcastDescription.value
    const podcastCover = event.target.podcastCover.files[0]
    const podcastAuthor = event.target.podcastAuthor.value
    const podcastEmail = event.target.podcastEmail.value
    const podcastCategory = event.target.podcastCategory.value
    const podcastExplicit = event.target.podcastExplicit.checked ? "yes" : "no"
    const podcastLanguage = event.target.podcastLanguage.value
    const coverFileType = podcastCover.type
    // add attrs to input for SWC
    showObj.name = podcastName
    showObj.desc = podcastDescription
    showObj.author = podcastAuthor
    showObj.email = podcastEmail
    showObj.category = podcastCategory
    showObj.isExplicit = podcastExplicit
    showObj.lang = podcastLanguage
    // upload cover, send all to Arweave
    let cover = await processFile(podcastCover)
    let showObjSize = JSON.stringify(showObj).length
    let bytes = cover.byteLength + showObjSize + coverFileType.length
    
    setIsUploading(true)

    if (await userHasEnoughAR(t, bytes) === "all good") {
      await uploadToArweave(cover, coverFileType, showObj)
    } else {
      console.log('upload failed')
      setIsUploading(false)
    };
  }

  const languageOptions = () => {
    const langsArray = Object.entries(languages);
    let optionsArr = []
    for (let lang of langsArray) {
      optionsArr.push(
        <option value={lang[0]} key={lang[1]}>{lang[1]}</option>
      )
    }
    return optionsArr
  }

  const categoryOptions = () => {
    let optionsArr = []
    for (let i in categories) {
      optionsArr.push(
        <option value={categories[i]} key={i}>{categories[i]}</option>
      )
    }
    return optionsArr
  }

  return (
    <>
      <label htmlFor="my-modal-2" className="btn btn-outline btn-primary btn-sm md:btn-md modal-button mx-3"  onClick={() => setShow(true)} >+ {t("uploadshow.addpoadcast")}</label>
      <input type="checkbox" id="my-modal-2" className="modal-toggle" checked={show ? "checked" : false} readOnly />
      <div className="modal overflow-scroll">
        <div className="modal-box">
          <div className="label block uppercase text-center">
            <h1 className="mb-2">{t("uploadshow.title")}</h1>
            <p className="text-sm">{t("uploadshow.label")}</p>
          </div>
          <div className="form-control">
            <form onSubmit={handleShowUpload}>
              <div className='mb-3'>
                <span className="label label-text">{t("uploadshow.name")}</span>
                <input className="input input-bordered w-1/2" required pattern=".{2,500}" title="Between 2 and 500 characters" type="text" name="podcastName" placeholder="The Arweave Show" />
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.description")}</span>
                <textarea className="w-1/2 textarea textarea-bordered" required pattern=".{10,15000}" title="Between 10 and 15000 characters" as="textarea" name="podcastDescription" placeholder="This is a show about..." rows={3} />
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.image")}</span>
                <input required type="file" ref={podcastCoverRef} onChange={e => isPodcastCoverSquared(e)} name="podcastCover" />
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.author")}</span>
                <input className="input input-bordered w-1/2" required pattern=".{2,150}" title="Between 2 and 150 characters" type="text" name="podcastAuthor" placeholder="Sam Williams" />
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.email")}</span>
                <input className="input input-bordered w-1/2" type="email" name="podcastEmail" placeholder="your@email.net" />
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.language")}</span>
                <select className="select select-bordered w-1/2" id="podcastLanguage" name="language">
                  {languageOptions()}
                </select>
              </div>
              <div className='my-3'>
                <span className="label label-text">{t("uploadshow.category")}</span>
                <select className="select select-bordered w-1/2" id="podcastCategory" name="category">
                  {categoryOptions()}
                </select>
              </div>
              <div className='my-3'>
                <label className="cursor-pointer label flex justify-start mt-3">
                  <input id="podcastExplicit" type="checkbox" className="checkbox checkbox-primary mx-2" />
                  <span className="label-text">{t("uploadshow.explicit")}</span>
                </label>
              </div>
              <div className="text-yellow-400 bg-slate-700 rounded-lg p-4">Attention! Uploading the show will cost <span className="text-lg font-bold underline">0.25AR</span> + fees.</div>
              <div className="modal-action">
                {isUploading ? (
                  <button type="button" className="btn btn-primary p-2 rounded-lg" disabled>
                    <div className="animate-spin border-t-2 rounded-t-full border-indigo-500 h-5 w-5 mr-3" viewBox="0 0 24 24"></div>
                    {t("uploadshow.uploading")}
                  </button>
                ): (
                  <button htmlFor="my-modal-2" type="submit" className="btn btn-primary">{t("uploadshow.upload")}</button>
                )}
                <label htmlFor="my-modal-2" className="btn" onClick={() => setShow(false)}>{t("uploadshow.cancel")}</label>
              </div>
            </form>
          </div>

        </div>
      </div >
    </>
  )
}
