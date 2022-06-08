import Swal from 'sweetalert2'

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
