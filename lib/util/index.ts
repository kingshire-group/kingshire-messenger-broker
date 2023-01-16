import Logger from "../logger"

export const formatMessage = (message: any) => 
  typeof message === 'string' ? message : 
    typeof message === 'object' ? JSON.stringify(message):
      undefined

export const parseMessage = (message: any) => {
  try {
    return JSON.parse(message)
  } catch (error) {
    Logger.warn(`${message} - cannot parsed as JSON`)
    throw error
  }
}