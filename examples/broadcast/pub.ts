import { RabbitEssentials } from '../../lib/drivers/interface'
import { Rabbit } from '../../lib/drivers/Rabbit'
import { PubSub } from '../../lib/PubSub'
import { pubsub } from  '../../lib/config' 

const CHANNEL = 'channel'
const KEY = 'personal'

const publisher = async () => {
  const rabbitEssentials: RabbitEssentials = {
    endpoint: pubsub.endpoint,
    login: pubsub.login,
    password: pubsub.password,
    exchange: {
      name: 'Direct',
      type: 'topic'
    }
  }

  const rabbitQueue = new PubSub(
    new Rabbit(rabbitEssentials))

  await rabbitQueue.connect()
  await rabbitQueue.createChannel('tasks')

  const MESSAGE = process.argv.slice(2).join(' ') || 'Bernoulli Da Greatest fr'

  rabbitQueue.publish(rabbitEssentials.exchange.name, CHANNEL, MESSAGE, KEY)

  setTimeout(() => {
    rabbitQueue.close()
    process.exit(0)
  }, 500)
}

publisher()
