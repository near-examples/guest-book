import 'regenerator-runtime/runtime'
import React, { useCallback, useEffect, useState } from 'react'
import Big from 'big.js'
import Contract from './contract'
import { account } from 'near-api'

const SUGGESTED_DONATION = '1'
const BOATLOAD_OF_GAS = Big(1).times(10 ** 16).toFixed()

const App = () => {
  const [messages, setMessages] = useState([])

  const [currentUser, setCurrentUser] = useState()

  useEffect(() => {
    // fetch fresh account state (including balance) on app load
    //
    // if user logged in, `account.state()` returns current user's info;
    // else, returns null
    //
    // note: if timely balance info is needed for your app, you may want to
    // subscribe to this call, using something like react-offline-first-helpers
    account.state().then(setCurrentUser)
  }, [])

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    Contract.getMessages().then(setMessages)
  }, [])

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { fieldset, message, donation } = e.target.elements

    fieldset.disabled = true

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    Contract.addMessage(
      { text: message.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      Contract.getMessages().then(messages => {
        setMessages(messages)

        message.value = ''
        donation.value = SUGGESTED_DONATION
        fieldset.disabled = false
        message.focus()
      })
    })
  }, [])

  const signIn = useCallback(() => {
    account.login(
      process.env.CONTRACT_NAME,
      'NEAR Guest Book'
    )
  }, [])

  const signOut = useCallback(() => {
    account.logout()
    setCurrentUser(null)
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
      {!!messages.length && (
        <>
          <h2>Messages</h2>
          {messages.map((message, i) =>
            // TODO: format as cards, add timestamp
            <p key={i} className={message.premium ? 'is-premium' : ''}>
              <strong>{message.sender}</strong>:<br/>
              {message.text}
            </p>
          )}
        </>
      )}
    </main>
  )
}

export default App
