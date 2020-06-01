import { context, u128 } from 'near-sdk-as'
import PersistentOrderedMap from './PersistentOrderedMap'

/**
 * Exporting a new class Message so it can be used outside of this file.
 */
@nearBindgen
export class Message {
  premium: boolean
  sender: string
  constructor(public text: string) {
    // for this app, we want to consider a message "premium" if a
    // donation of at least 0.01Ⓝ  was attached
    this.premium = context.attachedDeposit >= u128.from('10' + '0'.repeat(21))
    this.sender = context.sender
  }

  @operator('==')
  eq(other: Message): boolean {
    return this.premium == other.premium &&
      this.sender == other.sender &&
      this.text == other.text &&
      this.sender == other.sender
  }
}

export const messages = new PersistentOrderedMap<string, Message>('messages')
