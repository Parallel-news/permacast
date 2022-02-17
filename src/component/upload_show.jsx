import { React, useState, useRef } from 'react';
import ArDB from 'ardb';
import { CONTRACT_SRC, arweave, languages, categories, smartweave } from '../utils/arweave.js'
import Swal from 'sweetalert2';
const ardb = new ArDB(arweave)

export default function UploadShow() {
  let finalShowObj = {}
  const [show, setShow] = useState(false);
  const podcastCoverRef = useRef()

  const deployContract = async () => {
    const initialState = `{"podcasts": []}`
    const tx = await arweave.createTransaction({ data: initialState })

    tx.addTag("Protocol", "permacast-testnet-v3")
    tx.addTag("Action", "launchCreator")
    tx.addTag("App-Name", "SmartWeaveAction")
    tx.addTag("App-Version", "0.3.0")
    tx.addTag("Contract-Src", CONTRACT_SRC)
    tx.addTag("Content-Type", "application/json")
    tx.addTag("Timestamp", Date.now())

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
      title: 'Uploading, please wait a few seconds...',
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

    const tx = await ardb.search('transactions')
      .from(addr)
      .tag('App-Name', 'SmartWeaveAction')
      .tag('Action', 'launchCreator')
      .tag('Protocol', 'permacast-testnet-v3')
      .tag('Contract-Src', CONTRACT_SRC)
      .find();

    console.log(tx)
    if (tx.length !== 0) {
      contractId = tx[0].id
    }
    if (!contractId) {
      console.log('not contractId - deploying new contract')
      contractId = await deployContract()
    }
    let input = {
      'function': 'createPodcast',
      'name': show.name,
      'desc': show.desc,
      'cover': show.cover,
      'lang': show.lang,
      'isExplicit': show.isExplicit,
      'author': show.author,
      'categories': show.category,
      'email': show.email
    }

    let tags = { "Contract-Src": contractId, "App-Name": "SmartWeaveAction", "App-Version": "0.3.0", "Content-Type": "application/json" }
    let contract = smartweave.contract(contractId).connect("use_wallet");
    let uploadTxId = await contract.writeInteraction(input, tags);
    if (uploadTxId) {
      Swal.fire({
        title: 'Show added',
        text: 'Show added permanently to Arweave. Check in a few minutes after the transaction has mined.',
        icon: 'success',
        customClass: "font-mono",
      })
      console.log(uploadTxId)
    } else {
      alert('An error occured.')
    }
  }

  const uploadToArweave = async (data, fileType, showObj) => {
    console.log('made it here, data is')
    console.log(data)
    arweave.createTransaction({ data: data }).then((tx) => {
      tx.addTag("Content-Type", fileType);
      tx.reward = (+tx.reward * 1).toString();
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
              title: 'Unable to add show',
              text: 'Check your wallet balance and network connection',
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
      text: 'Podcast cover image is not squared (1:1 aspect ratio)!',
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
    <>
      <label htmlFor="my-modal-2" className="btn btn-outline btn-primary btn-sm md:btn-md modal-button mx-3" onClick={() => setShow(true)} >+ Add a podcast</label>
      <input type="checkbox" id="my-modal-2" className="modal-toggle" checked={show ? "checked" : false} readOnly />
      <div className="modal overflow-scroll">
        <div className="modal-box">
          <div className="label block uppercase text-center">
            <h1 className="mb-2">Add a new show</h1>
            <p className="text-sm">You'll add episodes to the show next.</p>
          </div>
          <div className="form-control">
            <form onSubmit={handleShowUpload}>
              <div className='mb-3'>
                <span className="label label-text">Show name</span>
                <input className="input input-bordered w-1/2" required pattern=".{3,50}" title="Between 3 and 50 characters" type="text" name="podcastName" placeholder="The Arweave Show" />
              </div>
              <div className='my-3'>
                <span className="label label-text">Show description</span>
                <textarea className="w-1/2 textarea textarea-bordered" required pattern=".{10,75}" title="Between 10 and 75 characters" as="textarea" name="podcastDescription" placeholder="This is a show about..." rows={3} />
              </div>
              <div className='my-3'>
                <span className="label label-text">Cover image</span>
                <input required type="file" ref={podcastCoverRef} onChange={e => isPodcastCoverSquared(e)} name="podcastCover" />
              </div>
              <div className='my-3'>
                <span className="label label-text">Author</span>
                <input className="input input-bordered w-1/2" required pattern=".{2,50}" title="Between 2 and 50 characters" type="text" name="podcastAuthor" placeholder="Sam Williams" />
              </div>
              <div className='my-3'>
                <span className="label label-text">Email</span>
                <input className="input input-bordered w-1/2" type="email" name="podcastEmail" placeholder="your@email.net" />
              </div>
              <div className='my-3'>
                <span className="label label-text">Podcast language</span>
                <select className="select select-bordered w-1/2" id="podcastLanguage" name="language">
                  {languageOptions()}
                </select>
              </div>
              <div className='my-3'>
                <span className="label label-text">Category</span>
                <select className="select select-bordered w-1/2" id="podcastCategory" name="category">
                  {categoryOptions()}
                </select>
              </div>
              <div className='my-3'>
                <label className="cursor-pointer label flex justify-start mt-3">
                  <input id="podcastExplicit" type="checkbox" className="checkbox checkbox-primary mx-2" />
                  <span className="label-text">Contains explicit content</span>
                </label>
              </div>
              <div className="modal-action">
                <button htmlFor="my-modal-2" type="submit" className="btn btn-primary">Upload</button>
                <label htmlFor="my-modal-2" className="btn" onClick={() => setShow(false)}>Cancel</label>
              </div>
            </form>
          </div>

        </div>
      </div >
    </>
  )
}
