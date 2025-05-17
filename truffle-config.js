module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,       // Must match Ganache's port
      network_id: "*",  // Match any network id
      gas: 6721975,     // Gas limit
      gasPrice: 20000000000 // 20 Gwei
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Must match your pragma in Voting.sol
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};