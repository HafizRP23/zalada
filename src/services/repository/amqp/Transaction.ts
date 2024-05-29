import amqp from "@infrastructure/amqp";


export async function NewOrderAsync(payload: any) {
    const instance = amqp.getInstance()

    await instance.assertExchange('orders', 'fanout', { durable: true })

    // await instance.assertQueue('orders', { durable: false })
    
    // const data = JSON.stringify(payload)

    // instance.sendToQueue('orders', Buffer.from(data))

    return true
}