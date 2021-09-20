import ArweaveMultihost from 'arweave-multihost'

export const arweave = ArweaveMultihost.initWithDefaultHosts({
  timeout: 10000,         // Network request timeouts in milliseconds
  logging: false,          // Enable network request logging
  logger: null,    // Logger function
  onError: console.error, // On request error callback
});

//export const CONTRACT_SRC = "BBehhFXakigwzVtCe1zQyVJDYCycLVBFrNpQDp1Z1eE"
export const CONTRACT_SRC = "aDDvmtV6Rg15LZ5Hp1yjL6strnyCsVbmhpfPe0gT21Y"

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