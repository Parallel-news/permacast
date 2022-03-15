import ArDB from "ardb";
import { arweave, CONTRACT_SRC } from "./arweave";

const ardb = new ArDB(arweave);

export const getSwcId = async () => {
  await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
  let addr = await window.arweaveWallet.getActiveAddress(); //await getAddrRetry()
  if (!addr) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
    addr = await window.arweaveWallet.getActiveAddress();
  }
  const tx = await ardb
    .search("transactions")
    .from(addr)
    .tag("App-Name", "SmartWeaveAction")
    .tag("Action", "launchCreator")
    .tag("Protocol", "permacast-testnet-v3")
    .tag("Contract-Src", CONTRACT_SRC)
    .find();

  if (!tx || tx.length === 0) {
    throw new Error("No swc id found");
  }

  console.log("tx", tx);
  return tx[0].id;
};
