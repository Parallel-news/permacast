import { useContext } from 'react';
import { appContext } from '../utils/initStateGen';
import { React, useState, useRef } from 'react';
import { CONTRACT_SRC, FEE_MULTIPLIER, arweave, deployContract } from '../utils/arweave'
import { languages_en, languages_zh, categories_en, categories_zh } from '../utils/languages';
import { processFile, userHasEnoughAR } from '../utils/shorthands';
import ArDB from 'ardb';
import { PhotographIcon } from '@heroicons/react/outline';

import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
const ardb = new ArDB(arweave)

export default function UploadPodcastView() {
  const appState = useContext(appContext);
  // remove state from here
  const [show, setShow] = useState(false);
  const [img, setImg] = useState();
  const [isUploading, setIsUploading] = useState(false);

  let finalShowObj = {}
  const podcastCoverRef = useRef()
  const { t, i18n } = useTranslation()
  const languages = i18n.language === 'zh' ? languages_zh : languages_en
  const categories = i18n.language === 'zh' ? categories_zh : categories_en

  const uploadShow = async (show) => {
    Swal.fire({
      title: t("uploadshow.swal.uploading.title"),
      timer: 2000,
      customClass: "font-mono",
    })
    let contractId

    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION", "SIGNATURE"])
    let addr = await window.arweaveWallet.getActiveAddress()

    if (!addr) {
      await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
      addr = await window.arweaveWallet.getActiveAddress()
    }
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

  const isPodcastCoverSquared = (event) => {
    if (event.target.files.length !== 0) {
      const podcastCoverImage = new Image()
      podcastCoverImage.src = window.URL.createObjectURL(event.target.files[0])
      podcastCoverImage.onload = () => {
        if (podcastCoverImage.width !== podcastCoverImage.height) {
          podcastCoverRef.current.value = ""
          Swal.fire({
            text: t("uploadshow.swal.reset.text"),
            icon: 'warning',
            confirmButtonText: 'Continue',
            customClass: "font-mono",
          })
        }
        else {
          setImg(URL.createObjectURL(event.target.files[0]))
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
    //<option disabled defaultValue>Language</option>
    let optionsArr = []
    for (let lang of langsArray) {
      optionsArr.push(
        <option value={lang[0]} key={lang[1]}>{lang[1]}</option>
      )
    }
    return optionsArr
  }

  const categoryOptions = () => {
    // <option disabled defaultValue>Category</option>
    let optionsArr = []
    for (let i in categories) {
      optionsArr.push(
        <option value={categories[i]} key={i}>{categories[i]}</option>
      )
    }
    return optionsArr
  }

  const handleChangeImage = e => {
    isPodcastCoverSquared(e)
  }

  return (
    <div className="text-zinc-400 h-full">
      <h1 className="text-2xl tracking-wider">New Show</h1>
      <div className="form-control">
        <form onSubmit={handleShowUpload}>
          <input required type="file" accept="image/*" className="opacity-0 z-index-[-1] absolute" ref={podcastCoverRef} onChange={e => handleChangeImage(e)} name="podcastCover" id="podcastCover" />
          <div className="md:flex mt-7">
            <label htmlFor="podcastCover" className="cursor-pointer transition duration-300 ease-in-out hover:text-white flex md:block md:h-full w-48">
              {podcastCoverRef.current?.files?.[0] ? (
                <div className="cursor-pointer bg-zinc-900 h-48 w-48 rounded-[20px] flex items-center justify-center">
                  <img src={img} className="h-48 w-48" />
                </div>
              ) : (
                <div className="cursor-pointer bg-zinc-900 h-48 w-48 rounded-[20px] flex items-center justify-center">
                  <div className="cursor-pointer outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <div className="flex justify-center">
                      <div className="cursor-pointer">
                        <PhotographIcon className="h-11 w-11" />
                      </div>
                    </div>
                    <div className="flex justify-center pt-2">
                      <div className="text-lg tracking-wider">Cover image</div>
                    </div>
                  </div>
                </div>
              )}
            </label>
            <div className="ml-0 md:ml-10 mt-10 md:mt-0 fields w-5/6">
              <div className="h-48 mb-10">
                <div className="mb-5">
                  <input className="input input-secondary w-full bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Show name..." required pattern=".{2,500}" title="Between 2 and 500 characters" type="text" name="podcastName" />
                </div>
                <div>
                  <textarea className="input input-secondary resize-none py-3 px-5 w-full h-[124px] bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Description..." required pattern=".{10,15000}" title="Between 10 and 15000 characters" name="podcastDescription" />
                </div>
              </div>
              <div className="mb-5">
                <input className="input input-secondary w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Author name..." name="podcastAuthor" />
              </div>
              <div className="mb-10 ">
                <input className="input input-secondary w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Email..." type="email" name="podcastEmail" />
              </div>
              <div className="mb-5">
                <select className="select select-secondary w-1/2 py-3 px-5 font-light bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="podcastCategory" name="category">
                  {categoryOptions()}
                </select>
              </div>
              <div className="mb-5">
                <select className="select select-secondary w-1/2 py-3 px-5 font-light	bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="podcastLanguage" name="language">
                  {languageOptions()}
                </select>
              </div>
              <label className="flex">
                <input id="podcastExplicit" type="checkbox" className="checkbox checkbox-ghost bg-yellow mr-2" />
                <span className="label-text cursor-pointer">{t("uploadshow.explicit")}</span>
              </label>
              <div className="flex place-content-end pb-28">
                {isUploading ? (
                  <button type="button" className="btn btn-primary p-2 rounded-lg" disabled>
                    <div className="animate-spin border-t-3 rounded-t-full border-yellow-100 h-5 w-5 mr-3" viewBox="0 0 24 24"></div>
                    {t("uploadshow.uploading")}
                  </button>
                ): (
                  <button type="submit" className="btn btn-secondary">{t("uploadshow.upload")}</button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
