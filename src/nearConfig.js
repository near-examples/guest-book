const env = process.env.NODE_ENV || 'development'

export const contractName = process.env.CONTRACT_NAME || 'guest-book'

export const helperUrl = {
  development: 'https://near-contract-helper.onrender.com',
  production: 'https://near-contract-helper.onrender.com',
  staging: 'https://near-contract-helper-staging.onrender.com'
}[env]

export const keyPath = {
  local: `${process.env.HOME}/.near/validator_key.json`
}[env]

export const masterAccount = {
  test: 'test.near',
  ci: 'test.near',
  'ci-staging': 'test.near'
}[env]

export const networkId = {
  development: 'default',
  production: 'default',
  staging: 'staging',
  local: 'local',
  test: 'shared-test',
  ci: 'shared-test',
  'ci-staging': 'shared-test-staging',
  tatooine: 'tatooine'
}[env]

export const nodeUrl = {
  development: 'https://rpc.nearprotocol.com',
  production: 'https://rpc.nearprotocol.com',
  staging: 'https://staging-rpc.nearprotocol.com/',
  local: 'http://localhost:3030',
  test: 'http://shared-test.nearprotocol.com:3030',
  ci: 'http://shared-test.nearprotocol.com:3030',
  'ci-staging': 'http://staging-shared-test.nearprotocol.com:3030',
  tatooine: 'https://rpc.tatooine.nearprotocol.com'
}[env]
