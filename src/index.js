import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as nearAPI from 'near-api-js'
import {
  contractName,
  networkId,
  nodeUrl
} from './nearConfig.js'

// Initializing contract
async function initContract () {
  // Initializing connection to the NEAR DevNet
  const near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    },
    networkId,
    nodeUrl
  })

  // Needed to access wallet
  const walletConnection = new nearAPI.WalletConnection(near)

  // Get Account ID – if still unauthorized, it's an empty string
  const accountId = walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  const contract = await new nearAPI.Contract(walletConnection.account(), contractName, {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['addMessage'],
    // Sender is the account ID to initialize transactions.
    sender: accountId
  })

  return { contract, walletConnection }
}

window.nearInitPromise = initContract()
  .then(({ contract, walletConnection }) => {
    ReactDOM.render(
      <App contract={contract} wallet={walletConnection} />,
      document.getElementById('root')
    )
  })
