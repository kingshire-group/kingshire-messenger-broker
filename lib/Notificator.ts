import { PubSubDriver, NotificationDriver } from "./drivers/interface";
import Logger from './logger'

class Notificator{
  pubsub: PubSubDriver | undefined
  isInitialized: boolean

  constructor(args: NotificationDriver){
    this.pubsub = args.pubsub;
    this.isInitialized = false;
  }

  async init() {
    if(this.isInitialized) return;
    try {
      Logger.info('Notification initialization started...')
    } catch (error) {
      Logger.error('Notification initialization failed.')
      throw error;
    }
  }
}

export { Notificator };