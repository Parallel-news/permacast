import { useContext } from 'react';
import { PhotographIcon } from '@heroicons/react/outline';
import { appContext } from '../utils/initStateGen';
import { React, useState, useRef } from 'react';
import ArDB from 'ardb';
import { CONTRACT_SRC, FEE_MULTIPLIER, arweave, languages_en, languages_zh, categories_en, categories_zh, smartweave } from '../utils/arweave.js'
import { generateFactoryState } from '../utils/initStateGen.js';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
const ardb = new ArDB(arweave)

export default function UploadPodcastView() {
  const appState = useContext(appContext);
  let finalShowObj = {}
  const [show, setShow] = useState(false);
  const podcastCoverRef = useRef()
  const { t, i18n } = useTranslation()
  const languages = i18n.language === 'zh' ? languages_zh : languages_en
  const categories = i18n.language === 'zh' ? categories_zh : categories_en

  const deployContract = async (address) => {

    const initialState = await generateFactoryState(address);
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
    } catch (err) {
      console.log(err);
    }
  }

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
    await uploadToArweave(cover, coverFileType, showObj)
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
    <div className="text-white h-screen">
      <h1 className="text-2xl tracking-wider">New Show</h1>
      <div className="form-control">
        <form onSubmit={handleShowUpload}>
        </form>
      </div>
      <div className="flex mt-7">
        <div className="h-full w-1/6 mr-10">
          <input required type="file" className="opacity-0 z-index-[-1] absolute" ref={podcastCoverRef} onChange={e => isPodcastCoverSquared(e)} name="podcastCover" id="podcastCover" />
          <div className="bg-zinc-900 h-48 w-48 rounded-[20px]">
            <label for="podcastCover" className="cursor-pointer outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <div className="flex justify-center">
                <div className="pt-14">
                  <PhotographIcon className="h-11 w-11" />
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <div className="text-lg tracking-wider">Cover image</div>
              </div>
            </label>
          </div>
        </div>
        <div className="fields w-5/6">
          <div className="h-48 mb-10">
            <div className="mb-5">
              <input className="py-3 px-5 w-full bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Show name..." required pattern=".{2,500}" title="Between 2 and 500 characters" type="text" name="podcastName" />
            </div>
            <div>
              <input className="py-3 px-5 w-full h-[124px] bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Description..." required pattern=".{10,15000}" title="Between 10 and 15000 characters" name="podcastDescription" />
            </div>
          </div>
          <div className="mb-5">
            <input className="w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Author name..." name="podcastAuthor" />
          </div>
          <div className="mb-10 ">
            <input className="w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" placeholder="Email..." type="email" name="podcastEmail" />
          </div>
          <div className="mb-5">
            <select className="select select-bordered w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="podcastCategory" name="category">
              {categoryOptions()}
            </select>
          </div>
          <div className="mb-5">
            <select className="select select-bordered w-1/2 py-3 px-5 bg-zinc-900 rounded-xl outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="podcastLanguage" name="language">
              {languageOptions()}
            </select>
          </div>
          <label>
            <input id="podcastExplicit" type="checkbox" className="checkbox checkbox-primary mx-2" />
            <span className="label-text">{t("uploadshow.explicit")}</span>
          </label>
          <div>
            <button type="submit" className="btn btn-primary rounded-lg">{t("uploadshow.upload")}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
