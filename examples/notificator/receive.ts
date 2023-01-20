import Logger from "../../lib/logger";
import { notificationService } from "../../lib/notification.service";

const receive = async () => {
  await notificationService.init()
  notificationService.receive(processMessage)
}

const processMessage = (messsage: string) => {
  console.log(` [*] Process this message - ${messsage}`)
  Logger.info(` [*] Process this message - ${messsage}`)
}

receive();