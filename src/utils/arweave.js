import ArweaveMultihost from 'arweave-multihost'

export const arweave = ArweaveMultihost.initWithDefaultHosts({
  timeout: 10000,         // Network request timeouts in milliseconds
  logging: false,          // Enable network request logging
  logger: null,    // Logger function
  onError: console.error, // On request error callback
});

// TEST CONTRACT:
//export const CONTRACT_SRC = "4uc2tYgjq75xb3Bc5vMZej-7INXxhaTA70NPL23Om4A"
//export const CONTRACT_SRC = "agSUFSa_1xvUuQ8ay9sLKNOI9BzEtJyPJL4CsyW250E"
//export const CONTRACT_SRC = "j1d4jwWRso3lH04--3rZ1Top_DaoGZWwwPKA8rT180M";
//export const CONTRACT_SRC = "IyjpXrCrL8CVEwRJuRsVSPMUNn3fUvIsqMUcp3_kmPs";
//export const CONTRACT_SRC = "FqUfSxgoic43S0wiO4_SCjzLgr0Vm2frcGU-PHhAjIU";
//export const CONTRACT_SRC = 'NavYxQSs268ije1-srcbPxYzEQLHPPE9ERkTGH3PB60';
//export const CONTRACT_SRC = "6wHEQehU7FtAax4bbVtx5uYVkGHX-Qnstd7dw-UKjEM";
export const CONTRACT_SRC = "KrMNSCljeT0sox8bengHf0Z8dxyE0vCTLEAOtkdrfjM";
export const NFT_SRC = "-xoIBH2TxLkVWo6XWAjdwXZmTbUH09_hPYD6itHFeZY";
// PROD CONTRACT:
//export const CONTRACT_SRC = "aDDvmtV6Rg15LZ5Hp1yjL6strnyCsVbmhpfPe0gT21Y"
export const NEWS_CONTRACT = "HJFEnaWHLMp2ryrR0nzDKb0DSW7aBplDjcs3vQoVbhw"
// + tag { name: "Protocol", values: "permacast-testnet-v3"}
export const queryObject = {
  query: 
    `query {
      transactions(
        tags: [
          { name: "Contract-Src", values: "${CONTRACT_SRC}"},
          { name: "Protocol", values: "permacast-testnet-v3"}
        ]
      first: 1000000
      ) {
      edges {
        node {
          id
        }
      }
    }
  }`
}