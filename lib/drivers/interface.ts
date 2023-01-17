export function instanceOfPubSubDriver(input: any): input is PubSubDriver{
  return 'connect' in input
}

export function instanceOfRabbitDriver(input: any): input is RabbitDriver{
  return '_messageHanler' in input
}

export interface NotificationDriver{
  pubsub?: PubSubDriver
  driver?: RabbitDriver
}

export interface RabbitDriver extends PubSubDriver{
  _recreateChannels(): Promise<void>
  _reassignHandlers(): Promise<void>
  _messageHanler(topic: object, messageHandler: any): Promise<void>
}

export interface PubSubDriver{
  channels: object
  handlers: object
  connect(): Promise<void> | ThisType<this>
  createChannel(channel: string): Promise<void>
  publish(topic:any, message:string): void
  subscribe(topic: any, messageHandler: any): void
  close(): void
}

export interface RabbitCredentials{
  endpoint: string //where the pubsub process is runnign
  login: string
  password: string
}