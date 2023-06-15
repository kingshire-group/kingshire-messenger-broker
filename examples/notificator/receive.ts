import Logger from '../../lib/logger'
import { notificationService } from '../../lib/notification.service'

const receive = async () => {
  await notificationService.init()
  notificationService.receive(processMessage)
}

const processMessage = (messsage: string) => {
  console.log(` [*] Processing this message - ${messsage}`)
  setTimeout(() => {
    Logger.info(` [√] Message processed`)
  }, 5000)

  return
}

receive()