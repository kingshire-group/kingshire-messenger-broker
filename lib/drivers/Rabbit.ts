const amqplib = require('amqplib/callback_api');
import Logger from '../logger';
import { formatMessage, parseMessage} from '../util'
import { RabbitCredentials, RabbitDriver } from './interface'

class Rabbit implements RabbitDriver{
  isReconnecting: Boolean
  endpoint: string
  login: string
  password: string
  connection: any
  channels: object = {}
  handlers: object = {}
  connectionTries: number
  maxNumberOfConnectionTries: number
  
  constructor(args: RabbitCredentials){
   if(!args.endpoint) throw new Error('"Endpoint" is required')
   if(!args.login) throw new Error('"login" is required')
   if(!args.password) throw new Error('"password" is required')

   this.isReconnecting = false
   this.endpoint = args.endpoint
   this.login = args.login
   this.password = args.password
   this.connectionTries = 0
   this.maxNumberOfConnectionTries = 3
  }


  connect = async () => {
    const connectionURI: string = `amqp://${this.login}:${this.password}@${this.endpoint}`
    this.connectionTries++;

    try{
      this.connection = await new Promise((resolve, reject) => {
        amqplib.connect(connectionURI, (error: Error, connection: any) => {
          if (error) return reject(error)

          Logger.info(`Connection to RabbitMQ established - ${this.endpoint}`)
          resolve(connection)
        })
      })
    }catch(error){
      if(this.connectionTries === this.maxNumberOfConnectionTries) throw error;

      else{
        Logger.error(`Connection to RabbitMQ failed - ${this.endpoint}`);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 5000));
        Logger.info('Trying to reconnect to RabbitMQ....');
        return this.connect();
      }
    }

    this.connection.on('error', (error: Error) => {
      if(error.message !== 'Connection closing'){
        Logger.error('[AMPQ] connection error')
        Logger.error('error')
        this.isReconnecting = true
        return setTimeout(this.connect.bind(this), 5000)
      }
    })

    this.connection.on('close', () => {
      Logger.warn('[AMPQ] reconnecting started')
      this.isReconnecting = true
      return setTimeout(this.connect.bind(this), 5000)
    })

    if(this.isReconnecting){
      await this._recreateChannels()
      await this._reassignHandlers()
      Logger.info('Reconnected successfully')
      this.isReconnecting = false;
    }

    return this.connection
  }

  _recreateChannels = async () => {
    Logger.info('Recreating channels...')
    for(const channelName in this.channels){
      if(!this.channels[channelName]) continue
      await this.createChannel(channelName)
    }

    Logger.info('channel recreation completed.')
  }

  _reassignHandlers = async () => {
    Logger.info('Reassigning handlers...')
    for(const channelName in this.handlers){
      if(!this.handlers[channelName]) continue
      Logger.info(`Channel: ${channelName}`)
      for(const handler of this.handlers[channelName]){
        Logger.info(`subscribing for handlers: ${handler.name}`)
        this.subscribe(channelName, handler, true)
      }
    }
  }

  createChannel = async (channel: string, pubsubMode = true) => {
    this.channels[channel] = await new Promise((resolve, reject) => {
      this.connection.createChannel((error: Error, channel: any) => {
        if(error) {
          Logger.error(`Failed to create channel - ${channel}`)
          reject(error)
        }

        Logger.info(`Created channel ${channel}`)
        resolve(channel)
      })
    })

    this.channels[channel].assertExchange(channel, 'fanout', { durable: false})
    if(!this.handlers[channel]) this.handlers[channel] = []
    return this.channels[channel]
  }

  publish = async (exchange: any, message: any) => {
    try {
      const formattedMessage = formatMessage(message)
      Logger.info(`Publishing message '${formattedMessage?.slice(0, 40)}...' to channel '${exchange}'`)

      if(!formattedMessage) throw new Error('Message is empty - ${formatted message}');
      if(!this.channels[exchange]) throw Error(`Channel for exchange ${exchange} doesn't exist`)

      this.channels[exchange].publish(exchange, '', Buffer.from(formattedMessage))
    } catch (error: any) {
      if(!this.isReconnecting && error.message === 'Channel closed'){
        this.isReconnecting = true
        this.connect();
      }

      throw error
    }
  }

  subscribe = async (exchange: any, messageHandler: any, isReconnecting = false) => {
    Logger.info('subscribe...')
    if(!this.channels[exchange]) throw Error (`Channel for Queue ${exchange} does not exists`)

    this.channels[exchange].assertQueue('', {exclusive: true}, (error: Error, queue: any) => {
      if(error) throw error

      Logger.info(`[*] Waiting for messages for ${exchange}. To exit press CTRL+C`)
      this.channels[exchange].bindQueue(queue.queue, exchange, '')
      this.channels[exchange].consume(queue.queue, (message: string) => {
        this._messageHanler({ exchange, message, noAck: true}, messageHandler)
      })
    })

    if(!isReconnecting) this.handlers[exchange].push(messageHandler)
  }

  close = () => {

  }
  _messageHanler = async ({exchange: queue, message, noAck = false}, messageHandler: any) => {
    const messageString = message.content.toString();
    Logger.info(` [x] Received "${messageString.slice(0, 40)}..."`)
    if(typeof messageHandler === 'function') messageHandler(parseMessage(messageString))
    if(noAck) return

    setTimeout(() => {
      Logger.info(' [X] Done')
      this.channels[queue].ack(message)
    }, 1000);
  }
}
export { Rabbit }