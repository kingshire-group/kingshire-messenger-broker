import { notificationService } from "../../lib/notification.service";

const notify = async () => {
  var iterator: number = 0
  await notificationService.init()

  setInterval(() => {
    notificationService.notify(`text: iteration ${iterator}`)
    ++iterator
  }, 5000)
}

notify();