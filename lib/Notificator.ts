import { PubSubDriver } from "./drivers/interface";
import Logger from './logger'

class Notificator{
  pubsub: PubSubDriver | undefined
  isInitialized: boolean

  constructor(args: PubSubDriver){
    this.pubsub = args;
    this.isInitialized = false;
  }

  async init() {
    if(this.isInitialized) return;
    try {
      Logger.info('Notification initialization started...')
      await this.pubsub?.connect()
      await this.pubsub?.createChannel('channel')
      this.isInitialized = true
      Logger.info('Notificator initialization completed.')
    } catch (error: any) {
      Logger.error(`Notification initialization failed - ${error.message}`)
      throw error;
    }
  }
}

export { Notificator };