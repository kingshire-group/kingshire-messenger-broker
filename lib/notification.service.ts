import { pubsub } from './config'
import { RabbitDriver, RabbitEssentials } from './drivers/interface'
import { Rabbit } from './drivers/Rabbit'
import { Notificator } from './Notificator'
import { PubSub } from './PubSub'

const rabbitEssentials: RabbitEssentials = {
  endpoint: pubsub.endpoint,
  login: pubsub.login,
  password: pubsub.login,
  exchange: {
    name: 'notification',
    type: 'direct'
  },
  queueName: 'some_queue'
}

const rabbitDriver: RabbitDriver = new Rabbit(rabbitEssentials)

const notificationService = new Notificator( 
  new PubSub(rabbitDriver)
)

export { notificationService }
