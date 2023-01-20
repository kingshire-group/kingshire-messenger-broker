import { RabbitDriver, PubSubDriver, instanceOfPubSubDriver } from "./drivers/interface";

/* class PubSub{
  driver: RabbitDriver

  constructor(args: NotificationDriver){
    if (!args.driver) throw new Error('"driver" is required')
    if (!(instanceOfPubSubDriver(args.driver))) throw new Error('Driver does not implement interface of "PubSubDriver"')
    this.driver = args.driver
  }

 connect = async () => {
  * this.connect = await this.driver.connect();

  return this.connection; *
 }
}

export { PubSub } */