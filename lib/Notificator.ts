import { PubSubDriver } from "./drivers/interface";
import Logger from './logger'

class Notificator{
  pubsub: PubSubDriver | undefined
  isInitialized: boolean
  KEY: string
  CHANNEL: string

  constructor(args: PubSubDriver){
    this.pubsub = args;
    this.isInitialized = false;
    this.KEY = 'joK&IVi-7543$$pOpQE@mmdl'
    this.CHANNEL = 'channel'
  }

  async init() {
    if(this.isInitialized) return;
    try {
      Logger.info('Notification initialization started...')
      await this.pubsub?.connect()
      await this.pubsub?.createChannel(this.CHANNEL)
      this.isInitialized = true
      Logger.info('Notificator initialization completed.')
    } catch (error: any) {
      Logger.error(`Notification initialization failed - ${error.message}`)
      throw error;
    }
  }

  notify(message: string){
    if(!this.isInitialized){
      Logger.warn('Cannot notify. Notificator not intiated')
      return
    }

    try {
      this.pubsub?.publish('notification', this.CHANNEL, message, this.KEY)
    } catch (error: any) {
      Logger.error(`Failed to notify - ${error.message}`)
      throw error
    }
  }

  receive(messageHandler: any){
    if(!this.isInitialized){
      Logger.warn('Cannot notify. Notificator not intiated')
      return
    }

    try {
      this.pubsub?.subscribe(this.CHANNEL, messageHandler)
    } catch (error: any) {
      Logger.error(`Receive message failed - ${error.message}`)
      throw error
    }
  }
}

export { Notificator };