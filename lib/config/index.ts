export const pubsub:object = {
  endpoint : process.env.PUBSUB_ENDPOINT || 'localhost:5672',
  login    : process.env.RABBITMQ_USERNAME || 'test',
  password : process.env.RABBITMQ_PASSWORD || 'test'
}