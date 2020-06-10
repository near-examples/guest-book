import { contract } from 'near-api'

export class Contract {
  getMessages () {
    contract.view(process.env.CONTRACT_NAME, 'getMessages')
  }

  addMessage ({ text }, gas, amount) {
    contract.call(
      process.env.CONTRACT_NAME,
      'addMessage',
      { text },
      { gas, amount }
    )
  }
}
