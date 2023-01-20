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
  channels: object
  handlers: object
  connect(): Promise<void> | ThisType<this>
  createChannel(channel: string): Promise<void>
  publish(exchange: string, channel: string, message: string, routing_key: string): void
  subscribe(exchange: string, channel: string, messageHandler: any, binding_key: string): void
  close(): void
}

export interface RabbitEssentials{
  endpoint: string //where the pubsub process is runnign
  login: string
  password: string
  exchange: Exchange
}

export interface Exchange{
  name: string,
  type: string
}