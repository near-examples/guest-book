import 'regenerator-runtime/runtime'
import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { ulid } from 'ulid'

const SUGGESTED_DONATION = '1'
const BOATLOAD_OF_GAS = Big(1).times(10 ** 16).toFixed()

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState({})

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getMessages().then(setMessages)
  }, [])

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { fieldset, message, donation } = e.target.elements

    fieldset.disabled = true

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    contract.addMessage(
      {
        id: ulid(),
        text: message.value
      },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getMessages().then(messages => {
        setMessages(messages)

        message.value = ''
        donation.value = SUGGESTED_DONATION
        fieldset.disabled = false
        message.focus()
      })
    })
  }, [contract])

  const signIn = useCallback(() => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEAR Guest Book'
    )
  }, [])

  const signOut = useCallback(() => {
    wallet.signOut()
    window.location = '/'
  }, [])

  return (
    <main>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1>NEAR Guest Book</h1>
        {currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      {currentUser && (
        <form onSubmit={onSubmit}>
          <fieldset id="fieldset">
            <p>Sign the guest book, { currentUser.accountId }!</p>
            <p className="highlight">
              <label htmlFor="message">Message:</label>
              <input
                autoComplete="off"
                autoFocus
                id="message"
                required
              />
            </p>
            <p>
              <label htmlFor="donation">Donation (optional):</label>
              <input
                autoComplete="off"
                defaultValue={SUGGESTED_DONATION}
                id="donation"
                max={Big(currentUser.balance).div(10 ** 24)}
                min="0"
                step="0.01"
                type="number"
              />
              <span title="NEAR Tokens">Ⓝ</span>
            </p>
            <button type="submit">
              Sign
            </button>
          </fieldset>
        </form>
      )}
      {!!Object.keys(messages).length && (
        <>
          <h2>Messages</h2>
          {Object.keys(messages).map(id =>
            // TODO: format as cards, add timestamp
            <p key={id} className={messages[id].premium ? 'is-premium' : ''}>
              <strong>{messages[id].sender}</strong>:<br/>
              {messages[id].text}
            </p>
          )}
        </>
      )}
    </main>
  )
}

App.propTypes = {
  contract: PropTypes.shape({
    addMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
}

export default App
