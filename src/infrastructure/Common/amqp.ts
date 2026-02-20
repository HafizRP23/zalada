import { AMQPConnection } from "src/services/models/Common";
import amqplib from "amqplib"
import logger from "src/utils/logger";
import { Infrastructure } from "./base";

class AMQPService implements Infrastructure {
    private connection: Record<string, amqplib.Channel> = {}
    private instance: amqplib.Connection

    getInstance(name: string) {
        if(!this.connection[name]) {
            throw new Error("SERVICE_NOT_FOUND")
        }

        return this.connection[name]
    }

    /** Penerima message singlqqueue */
    async createSingleQueueProducer(params: AMQPConnection) {
        // Set up connection
        if(!this.instance) {
            this.instance = await amqplib.connect(params)
        }

        const channel = await this.instance.createChannel()

        await channel.assertQueue(params.queue, { durable: true })

        channel.prefetch(1)

        if(this.connection[params.serviceName]) {
            throw new Error("SERVICE_NAME_ALREADY_USED")
        }

        this.connection[params.serviceName] = channel

        logger.info({ message: `Queue producer ${params.queue} added...` })

        return channel
    }

    /** Process message singlequeue */
    async createSingleQueueConsumer({ queue, serviceName, ...params }: AMQPConnection) {
        if(!this.instance) {
            this.instance = await amqplib.connect(params)
        }

        const channel = await this.instance.createChannel()

        await channel.assertQueue(queue, { durable: true })

        if(this.connection[serviceName]) {
            // return this.connection[params.serviceName]
            throw new Error("SERVICE_NAME_ALREADY_USED")
        }

        this.connection[serviceName] = channel

        logger.info({ message: `Queue consumer ${queue} added...` })

        return this.connection[serviceName]
    }

    async publish(serviceName: string, payload: Record<any, any>) {
        try {
            const service = this.connection[serviceName]

            if (!service) {
                throw new Error("SERVICE_NOT_FOUND")
            }

            const data = JSON.stringify(payload)

            service.sendToQueue(serviceName, Buffer.from(data))

            return true
        } catch (error) {
            throw error
        }
    }

    async close() {
        try {
            // Close all channels
            for (const key in this.connection) {
                const channel = this.connection[key]
                await channel.close()
            }
            // Close connection
            if (this.instance) {
                await this.instance.close()
            }
        } catch (error) {
            logger.error({ message: "Error closing AMQP connection", error })
        }
    }
 }


export default new AMQPService()