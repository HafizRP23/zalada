import "dotenv/config"
import fastify from 'fastify'
import DatabaseService from '@infrastructure/database'
import MailerService from '@infrastructure/mailer'
import SwaggerService from '@infrastructure/swagger'
import RoutesService from "@infrastructure/routes"
import { envSchema } from "./src/config/app"
import { ajvFilePlugin } from "src/utils/ajv"
import { ZodError } from "zod"
import cron from "src/cron"
import AMQPService from "@infrastructure/amqp"

const server = fastify({ logger: process.env.NODE_ENV == "development" ? true : false, ajv: { plugins: [ajvFilePlugin] } })

async function main() {
    try {
        // Env Validation
        await envSchema.parseAsync(process.env)

        // Register Mail Service
        await MailerService.init()

        // Register rabbitmq (AMQP) service
        await AMQPService.createInstance({ connection_url: process.env.AMQP_URL })

        await server.register(SwaggerService)

        // Register all routes
        await server.register(RoutesService)

        // Initialize database service
        await DatabaseService.init()

        await server.ready()

        await cron()

        await server.listen({ port: process.env.NODE_PORT, host: process.env.NODE_HOST })        
    } catch (error) {
        // Handle error env schema
        if(error instanceof ZodError) {
            console.error(error.issues)
        } else {
            console.log(error)
        }
        
        process.exit(1)
    }

}

main()