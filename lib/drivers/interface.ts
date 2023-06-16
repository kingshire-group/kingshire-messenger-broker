export function instanceOfPubSubDriver(input: any): input is PubSubDriver{
  return 'connect' in input
}

export function instanceOfRabbitDriver(input: any): input is RabbitDriver{
  return '_messageHanler' in input
}

/* export interface NotificationDriver{
  pubsub?: PubSubDriver
  driver?: RabbitDriver
}
 */
export interface RabbitDriver extends PubSubDriver{
  _recreateChannels(exchange: string): Promise<void>
  _reassignHandlers(binding_key: string): Promise<void>
  _messageHanler(topic: object, messageHandler: any): Promise<void>
}

export interface PubSubDriver{
  connect(): Promise<void> | ThisType<this>
  createChannel(channel: string): Promise<void>
  publish(queueName: string, exchange: string, channel: string, message: string, routing_key: string): void
  subscribe(queueName: string, channel: string, messageHandler: any): void
  close(): void
}

export interface RabbitEssentials{
  endpoint: string
  login: string
  password: string
  exchange: Exchange
  queueName: string
}

export interface Exchange{
  name: string,
  type: string
}