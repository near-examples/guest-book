import { addMessage, getMessages } from '../main'
import { Message, messages } from '../model'

afterEach( () => {
  while (messages.length > 0) {
    messages.pop()
  }
})

describe('addMessage', () => {
  it('adds a message to the PersistentVector', () => {
    const id = 'some unique id'
    addMessage(id, 'hey')
    expect(messages.length).toBe(1, 'should only contain one message')
    expect(messages.getSome(id).text).toBe('hey')
  })
})

describe('getMessages', () => {
  it('returns an object mapping ids to messages', () => {
    const id = 'another unique id'
    addMessage(id, 'hey')
    const messagesMap = getMessages()
    expect(messagesMap.size).toBe(1)
    expect(messagesMap.get(id).text).toBe('hey')
  })

  it('only shows the last ten messages', () => {
    for (let i: i32 = 0; i < 11; i++) {
      const id = i.toString()
      const text = 'message #' + i.toString()
      addMessage(id, text)
    }
    const messagesMap = getMessages()
    expect(messagesMap.keys().length).toBe(10)
    const messageIDs: string[] = messagesMap.keys()
    expect(messageIDs).not.toIncludeEqual('0', "shouldn't contain the first element")
  })
})
