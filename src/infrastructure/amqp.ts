import amqp from "amqplib"

type CreateInstance = { name?: string, connection_url: string }

class AMQPService {
    private instances: Record<string, amqp.Channel> = {}

    async createInstance({ connection_url, name = "main" }: CreateInstance) {
        try {
            // Checking instances name available
            if(this.instances[name] != undefined) {
                throw new Error("AMQP_INSTANCE_NAME_USED")
            }

            const connection = await amqp.connect(connection_url)
            this.instances[name] = await connection.createChannel()
        } catch (error) {
            throw error
        }
    }


    getInstance(name: string = "main") {
        if(this.instances[name] == undefined) {
            throw new Error("AMQP_INSTANCE_NOT_FOUND")
        }

        return this.instances[name]
    }
}


export default new AMQPService()