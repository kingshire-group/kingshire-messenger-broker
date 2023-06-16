import amqplib from 'amqplib/callback_api'
import Logger from '../logger'
import { formatMessage, parseMessage} from '../util'
import { RabbitEssentials, RabbitDriver, Exchange } from './interface'

class Rabbit implements RabbitDriver{
  isReconnecting: Boolean
  endpoint: string
  login: string
  password: string
  exchange: Exchange
  connection: any
  queueName: string
  binding_key: string
  channels: object
  handlers: object
  connectionTries: number
  maxNumberOfConnectionTries: number

  constructor(args: RabbitEssentials){
   if(!args.endpoint) throw new Error('"Endpoint" is required')
   if(!args.login) throw new Error('"login" is required')
   if(!args.password) throw new Error('"password" is required')
   if(!args.exchange.type) throw new Error('"exchange type" is required')

   this.isReconnecting = false
   this.endpoint = args.endpoint
   this.login = args.login
   this.password = args.password
   this.exchange = args.exchange
   this.queueName = args.queueName
   this.binding_key = ''
   this.connectionTries = 0
   this.maxNumberOfConnectionTries = 3
   this.channels = {}
   this.handlers = {}
  }

  connect = async () => {
    const connectionURI: string = 'amqp://localhost'//`amqp://${this.login}:${this.password}@${this.endpoint}`
    this.connectionTries++

    try{
      this.connection = await new Promise((resolve, reject) => {
        amqplib.connect(connectionURI, (error: Error, connection: any) => {
          if (error) return reject(error)

          Logger.info(`Connection to RabbitMQ established - ${connectionURI}`)
          resolve(connection)
        })
      })
    } catch(error) {
      if(this.connectionTries === this.maxNumberOfConnectionTries) throw error

      else{
        Logger.error(`Connection to RabbitMQ failed - ${this.endpoint}`)
        await new Promise<void>(resolve => setTimeout(() => resolve(), 5000))
        Logger.info('Trying to reconnect to RabbitMQ....')
        return this.connect()
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
      this.isReconnecting = false
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
        this.subscribe(this.queueName, channelName, handler)
      }
    }
  }

  createChannel = async (channelName: string) => {
    this.channels[channelName] = await new Promise((resolve, reject) => {
      this.connection.createChannel((error: Error, channel: any) => {
        if(error) {
          Logger.error(`Failed to create channel - ${channel}`)
          reject(error)
        }

        Logger.info(`Created channel ${channel}`)
        resolve(channel)
      })
    })

    this.channels[channelName].assertExchange(this.exchange.name, this.exchange.type, { durable: true })
    if(!this.handlers[channelName]) this.handlers[channelName] = []
    return this.channels[channelName]
  }

  publish = async (queueName: string, exchange: string, channelName: string, message: string, routing_key: string) => {
    try {
      const formattedMessage = formatMessage(message)
      Logger.info(`Publishing message '${formattedMessage?.slice(0, 40)}...' to channel '${channelName}'`)

      if(!formattedMessage) throw new Error('Message is empty - ${formatted message}')
      if(!this.channels[channelName]) throw Error(`Channel for exchange ${channelName} doesn't exist`)

      this.channels[channelName].assertQueue('queue', { exclusive: true, durable: true }, (error: Error, queue: any) => {
        if(error) throw error

        this.channels[channelName].bindQueue(queue.queue, exchange, routing_key)
        this.channels[channelName].publish(
          exchange, routing_key,
          Buffer.from(formattedMessage),
          { mandatory: true, persistent: true, delivery_mode: 2 }
        )
      })

      this.channels[channelName].on('return', (returnedMessage: any) => {
        Logger.error(`Failed to publish - ${returnedMessage.content.toString()}`)
      })
    } catch (error: any) {
      if(!this.isReconnecting && error.message.includes('Channel closed')){
        this.isReconnecting = true
        this.connect()
      }

      throw error
    }
  }

  subscribe = async (queueName: string, channelName: string, messageHandler: any, isReconnecting = false) => {
    Logger.info('subscribe...')
    if(!this.channels[channelName]) throw Error (`Channel for Queue ${channelName} does not exists`)

    this.channels[channelName].prefetch(1)
    this.channels[channelName].consume(queueName, (message: string) => {
      this._messageHanler({ channelName, message, noAck: false }, messageHandler)
    })
    /* this.channels[channelName].assertQueue('', { exclusive: true, durable: true }, (error: Error, queue: any) => {
      if(error) throw error

      Logger.info(` [*] Waiting for messages for ${channelName}. To exit press CTRL+C`)
      this.channels[channelName].bindQueue(queue.queue, exchange, binding_key)
      this.channels[channelName].prefetch(1)
      this.channels[channelName].consume(queue.queue, (message: string) => {
        this._messageHanler({ channelName, message, noAck: false }, messageHandler)
      })
    }) */

    if(!isReconnecting) this.handlers[channelName].push(messageHandler)
  }

  close = () => {
    this.connection.closed()
    Logger.info('closed connection.')
  }
  _messageHanler = async ({ channelName, message, noAck = false }, messageHandler: any) => {
    const messageString = message.content.toString()
    Logger.info(` [*] Received "${messageString.slice(0, 40)}..."`)
    if(typeof messageHandler === 'function') await messageHandler(messageString)
    if(noAck) return

    setTimeout(() => {
      //Logger.info(' [*] Done')
      this.channels[channelName].ack(message)
    }, 1000)
  }
}

export { Rabbit }