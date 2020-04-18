import 'regenerator-runtime/runtime'
import React from 'react'
import TestRenderer from 'react-test-renderer'
import App from '../App'
const { act } = TestRenderer

// Declare stubs for contract, walletConnection, and nearConfig
const contract = {
  account: {
    connection: {},
    accountId: 'test.near'
  },
  contractId: 'test.near',
  getMessages: () => new Promise(() => {}),
  addMessage: () => ''
}
const walletConnection = {
  requestSignIn: () => null,
  signOut: () => null,
  isSignedIn: () => false,
  getAccountId: () => 'test.near'
}

// For UI tests, use pattern from: https://reactjs.org/docs/test-renderer.html
let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

it('renders with proper title', () => {
  let testRenderer

  act(() => {
    testRenderer = TestRenderer.create(
      <App contract={contract} wallet={walletConnection} />
    )
  })

  const testInstance = testRenderer.root

  expect(testInstance.findByType('h1').children).toEqual(['NEAR Guest Book'])
})
