import { RabbitEssentials } from '../../lib/drivers/interface'
import { Rabbit } from '../../lib/drivers/Rabbit'
import { PubSub } from '../../lib/PubSub'
import { pubsub } from  '../../lib/config' 
import Logger from '../../lib/logger'

const CHANNEL = 'channel'
const KEY = 'personal'

const subscriber = async () => {
  const rabbitEssentials: RabbitEssentials = {
    endpoint: pubsub.endpoint,
    login: pubsub.login,
    password: pubsub.password,
    exchange: {
      name: 'Direct',
      type: 'direct'
    },
    queueName: ''
  }

  const rabbitQueue = new PubSub(
    new Rabbit(rabbitEssentials))

  await rabbitQueue.connect()
  await rabbitQueue.createChannel('tasks')

  rabbitQueue.subscribe(CHANNEL, processMessage)
}

const processMessage = (messsage: string) => {
  console.log(` [*] Process this message - ${messsage}`)
  Logger.info(` [*] Process this message - ${messsage}`)
}

subscriber()
