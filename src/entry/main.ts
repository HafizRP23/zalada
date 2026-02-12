import "dotenv/config"
import "@utils/sentry" // Initialize Sentry AFTER env vars are loaded but BEFORE app imports

import fastify from 'fastify'
import { ZodError } from "zod"
import * as Sentry from "@sentry/node"

import SwaggerService from '@infrastructure/Main/swagger'
import RoutesService from "@infrastructure/Main/routes"
import WebsocketService from "@infrastructure/Main/websocket"
import { ajvFilePlugin } from "src/utils/ajv"
import CronService from "src/cron"
import { InfraAMQP, InfraDB } from "@infrastructure/Common"
import { mainAppSchema } from "src/config/app"
import logger from "src/utils/logger"

const server = fastify({ ajv: { plugins: [ajvFilePlugin] } })

async function main() {
    try {
        // Env Validation
        await mainAppSchema.parseAsync(process.env)

        await InfraAMQP.createSingleQueueProducer({
            vhost: process.env.AMQP_VHOST,
            hostname: process.env.AMQP_HOST,
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PASSWORD,
            queue: process.env.AMQP_MAILER_QUEUE,
            serviceName: process.env.AMQP_MAILER_NAME
        })

        /** initialize sentry, for setup metrics */
        Sentry.setupFastifyErrorHandler(server)

        // Initialize database service
        await InfraDB.init()

        await server.register(SwaggerService)

        // Register all routes
        await server.register(RoutesService)

        await server.register(WebsocketService)

        await server.ready()

        await CronService()

        const url = await server.listen({ port: process.env.NODE_PORT, host: process.env.NODE_HOST })

        logger.info({ message: `server running at ${url}` })
    } catch (error) {
        Sentry.captureException(error)
        
        if (error instanceof ZodError) {
            const err = error.issues[0]
            console.error({ message: `${err.code} ${err.path[0]}` })
        } else {
            console.log(error)
        }

        // Wait for Sentry to send events before exiting
        await Sentry.close(2000)
        process.exit(1)
    }

}

main()