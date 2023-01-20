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

  notify(exchange: string, channel: string, message: string, routing_key: string){
    if(!this.isInitialized){
      Logger.warn('Cannot notify. Notificator not intiated')
      return
    }

    try {
      this.pubsub?.publish(exchange, channel, message, routing_key)
    } catch (error: any) {
      Logger.error(`Failed to notify - ${error.message}`)
      throw error
    }
  }

  receive(exchange: string, channel: string, messageHandler: any, binding_key: string){
    if(!this.isInitialized){
      Logger.warn('Cannot notify. Notificator not intiated')
      return
    }

    try {
      this.pubsub?.subscribe(exchange, channel, messageHandler, binding_key)
    } catch (error: any) {
      Logger.error(`Receive message failed - ${error.message}`)
      throw error
    }
  }
}

export { Notificator };