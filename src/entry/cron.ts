import "dotenv/config"
import "@utils/sentry" // Initialize Sentry AFTER env vars are loaded but BEFORE app imports

import { ZodError } from "zod"
import * as Sentry from "@sentry/node"

import CronService from "src/cron"
import { InfraAMQP, InfraDB } from "@infrastructure/Common"
import { cronAppSchema } from "src/config/app"
import logger from "src/utils/logger"

async function main() {
    try {
        // Env Validation
        await cronAppSchema.parseAsync(process.env)

        // Initialize database service
        await InfraDB.init()

        const jobs = await CronService()

        logger.info({ message: "Cron service running..." })

        // Graceful Shutdown
        const shutdown = async (signal: string) => {
            logger.info({ message: `Received ${signal}. Shutting down gracefully...` })

            try {
                // 1. Stop processing new requests
                logger.info("Fastify server closed")

                // 2. Stop Cron Jobs
                if (jobs && jobs.length > 0) {
                    jobs.forEach(job => job.stop())
                    logger.info(`${jobs.length} Cron jobs stopped`)
                }

                // 3. Close AMQP Connection
                await InfraAMQP.close()
                logger.info("AMQP connection closed")

                // 4. Close Database Connection
                await InfraDB.close()
                logger.info("Database connection closed")

                // 6. Close Sentry
                await Sentry.close(2000)
                logger.info("Sentry closed")

                process.exit(0)
            } catch (err) {
                logger.error({ message: "Error during shutdown", error: err })
                process.exit(1)
            }
        }

        process.on("SIGTERM", () => shutdown("SIGTERM"))
        process.on("SIGINT", () => shutdown("SIGINT"))

    

    } catch (error) {
        if (error instanceof ZodError) {
            console.error("❌ Invalid environment variables:");
            error.errors.forEach(e => {
                console.error(`  - ${e.path.join('.')}: ${e.message}`);
            });
        } else {
            console.error("❌ Application start error:", error);
        }

        process.exit(1)
    }

}

main()