import { pubsub } from "./config";
import { RabbitDriver } from "./drivers/interface";
import { Rabbit } from "./drivers/Rabbit";
import { Notificator } from "./Notificator";
import { PubSub } from "./PubSub";

const rabbitDriver: RabbitDriver = new Rabbit({
  endpoint: '',
  login: '',
  password: '',
  exchange: {
    name: '',
    type: ''
  }
})

const notificationService = new Notificator( 
  new PubSub(rabbitDriver)
)

export { notificationService }