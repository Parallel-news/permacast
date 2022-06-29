import Swal from 'sweetalert2'
import { arweave, FEE_MULTIPLIER } from '../utils/arweave.js'
import { getStorageTable } from 'arweave-fees.js'

export const swal = (t, status="success", txt="", extraText="") => {
  Swal.fire({
    title: t(`${txt}.title`),
    text: t(`${txt}.text`) + `${extraText}`,
    icon: status,
    customClass: "font-mono",
  })
}

export async function fetchWalletAddress() {
  await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION", "SIGNATURE"])
  let addr = await window.arweaveWallet.getActiveAddress()

  if (!addr) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
    addr = await window.arweaveWallet.getActiveAddress();
  }

  return addr
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

export async function processFile(file) {
  try {
    let contentBuffer = await readFileAsync(file);
    return contentBuffer
  } catch (err) {
    console.log(err);
  }
}

export async function calculateStorageFee(bytes) {
  const storagePrices = await getStorageTable()
  let costPerMB = storagePrices['MB'] ? storagePrices['MB'].ar : 0
  if (costPerMB === 0 || bytes === 0) return 0
  let cost = bytes * (costPerMB / 1024 / 1024)
  if (storagePrices['KB'].ar >= cost) {
    console.log('Size too small')
    cost = storagePrices['KB'].ar
  }
  return cost
}

export async function userHasEnoughAR (t, bytes, serviceFee) {
  let address = await fetchWalletAddress()
  let failText = 'generalerrors.'
  if (!address) return swal(t, 'error', failText + 'cantfindaddress')

  // this query returns balance in Winston units
  let balance = await arweave.wallets.getBalance(address).then((balance) => balance)

  let balanceInAR = balance * 1e-12
  let cost = await calculateStorageFee(bytes)
  if (cost === 0) swal(t, 'error', failText + 'cantfetchprices')
  cost = (cost * FEE_MULTIPLIER) + serviceFee

  let repr = cost.toFixed(2)
  console.log('this operation will cost (with x3 mining fee + serviceFee): ' + cost)
  console.log('this wallet has ' + balanceInAR)
  if (balanceInAR >= cost) return "all good"
  else return swal(t, 'error', failText + 'lowbalance', `${repr}` + ' AR')
}
