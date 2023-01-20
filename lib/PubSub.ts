import {  PubSubDriver, instanceOfPubSubDriver, RabbitDriver } from "./drivers/interface";

class PubSub implements PubSubDriver{
  driver: PubSubDriver
  connection: any;

  constructor(args: RabbitDriver){
    if (!args) throw new Error('"driver" is required')
    if (!(instanceOfPubSubDriver(args))) throw new Error('Driver does not implement interface of "PubSubDriver"')
    this.driver = args
  }

 connect = async () => {
  this.connection = await this.driver.connect();
  return this.connection
 }

 createChannel = async (channel:string) => 
  this.driver.createChannel(channel)

 publish = (exchange: string, channel: string, message: string, routing_key: string) => 
  this.driver.publish(exchange, channel, message, routing_key)

 subscribe = (exchange: string, channel: string, messageHandler: string, binding_key: string) => 
  this.driver.subscribe(exchange, channel, messageHandler, binding_key)

 close = () => this.driver.close()

}

export { PubSub }