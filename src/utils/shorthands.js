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

export function calculateStorageCostInAR(bytes, avgStoragePricePerKB, feeMultiplier) {
  return (Math.max(bytes, 1) / 1024) * avgStoragePricePerKB * feeMultiplier
}

export async function userHasEnoughAR (t, bytes) {
  const storagePrices = await getStorageTable()
  let address = await fetchWalletAddress()
  let failText = 'generalerrors.'
  if (!address) return swal(t, 'error', failText + 'cantfindaddress')

  // this query returns balance in Winston units
  let balance = await arweave.wallets.getBalance(address).then((balance) => balance)

  // https://docs.arweave.org/developers/server/http-api#ar-and-winston
  let balanceInAR = Math.max(balance, 1) / (10**12)
  let costPerKB = storagePrices['KB'] ? storagePrices['KB'].ar : 0

  if (costPerKB === 0) return swal(t, 'error', failText + 'cantfetchprices')
  const cost = calculateStorageCostInAR(bytes, costPerKB, FEE_MULTIPLIER)
  // if cost > 1 AR: show one decimal, if cost > 0.1 AR show 3 decimals, or show 8 by default
  let repr = cost > 1 ? cost.toFixed(1) : cost > 0.1? cost.toFixed(3) : cost.toFixed(8)
  console.log('this operation will cost ' + cost)
  console.log('this wallet has ' + balanceInAR)
  if (balanceInAR >= cost) return "all good"
  else return swal(t, 'error', failText + 'lowbalance', `${repr}` + ' AR')
}
