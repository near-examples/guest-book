import 'regenerator-runtime/runtime'
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { ulid } from 'ulid'
import { useCachedUpdater, useSubscribedGetter } from 'react-offline-first-helpers'

const SUGGESTED_DONATION = '1'
const BOATLOAD_OF_GAS = Big(1).times(10 ** 16).toFixed()

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [
    addMessage,
    syncingMessages,
    updateSyncingMessages
  ] = useCachedUpdater(
    contract.addMessage,
    {
      initialCacheValue: {},
      onFunctionCall: (cache, { id, ...message }) => {
        const newCache = { ...cache, [id]: message }
        return newCache
      },
      onError: (cache, error, { id, ...message }) => {
        const messages = [...cache]
        messages[id].error = error.message
        updateSyncingMessages(messages)
      }
    }
  )

  const persistedMessages = useSubscribedGetter(contract.getMessages, {
    initialValue: {},
    onUpdate: persistedMessages => {
      const newSyncingMessages = { ...syncingMessages }
      Object.keys(persistedMessages).forEach(id => {
        delete newSyncingMessages[id]
      })
      updateSyncingMessages(newSyncingMessages)
    }
  })

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { message, donation } = e.target.elements

    addMessage(
      {
        id: ulid(),
        text: message.value,
        sender: currentUser.accountId,
        donation: donation.value || 0
      },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    )

    message.value = ''
    donation.value = SUGGESTED_DONATION
    message.focus()
  }, [])

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
        </form>
      )}
      {(!!Object.keys(persistedMessages).length || !!Object.keys(syncingMessages).length) && (
        <h2>Messages</h2>
      )}
      {Object.keys(persistedMessages).map(id => (
        // TODO: format as cards, add timestamp
        <p key={id} className={persistedMessages[id].premium ? 'is-premium' : ''}>
          <strong>{persistedMessages[id].sender}</strong>:<br/>
          {persistedMessages[id].text}
        </p>
      ))}
      {Object.keys(syncingMessages).map(id => {
        const message = syncingMessages[id]
        return (
          <p key={id} style={{ color: 'gray' }}>
            <strong>{message.sender}</strong>:<br/>
            {message.text}
            {message.error && (
              <>
                <br />
                <span style={{ color: 'var(--red)' }}>
                  Syncing failed! {message.error}
                </span>
                <br />
                <button onClick={() => {
                  const messages = { ...syncingMessages }
                  delete messages[id].error
                  updateSyncingMessages(messages)
                  contract.addMessage(
                    message,
                    BOATLOAD_OF_GAS,
                    Big(message.donation).times(10 ** 24).toFixed()
                  )
                }}>
                  Retry
                </button>
              </>
            )}
          </p>
        )
      })}
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
