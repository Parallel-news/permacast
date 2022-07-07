import Swal from 'sweetalert2';

export function tipPrompt (t) {

  Swal.fire({
      title: t("podcasthtml.swal.title"),
      text: t("podcasthtml.swal.text"),
      customClass: "font-mono",
  })
  return false

  // const addr = await window.arweaveWallet.getActiveAddress();

  // const podcastId = id;
  // const name = name;
  // const recipient = props.owner;
  // const { value: tipAmount } = await Swal.fire({
  //     title: `Tip ${name} 🙏`,
  //     input: 'text',
  //     inputPlaceholder: 'Amount to tip ($NEWS)',
  //     confirmButtonText: 'Tip'
  // });

  // if (tipAmount && checkNewsBalance(addr, tipAmount)) {

  //     let n = parseInt(tipAmount);
  //     if (Number.isInteger(n) && n > 0) {

  //         if (transferNews(recipient, tipAmount)) {

  //             Swal.fire({
  //                 title: 'You just supported a great podcast 😻',
  //                 text: `${name} just got ${tipAmount} $NEWS.`
  //             })

  //         } else {
  //             Swal.fire({
  //                 title: 'Enter a whole number of $NEWS to tip.'
  //             })
  //         }
  //     }
  // }
}
