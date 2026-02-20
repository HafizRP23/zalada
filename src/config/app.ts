import * as z from 'zod'

const sentryDto = {
    SENTRY_DSN: z.string()
}

const mailAmqpDto = {
    AMQP_USERNAME: z.string(),
    AMQP_PASSWORD: z.string(),
    AMQP_HOST: z.string(),
    AMQP_PORT: z.preprocess(data => parseInt(data as string), z.number()),
    AMQP_MAILER_QUEUE: z.string(),
    AMQP_MAILER_NAME: z.string()
}

const mainDBDto = {
    DB_HOST: z.string(),
    DB_PASSWORD: z.string(),
    DB_USERNAME: z.string(),
    DB_NAME: z.string(),
    DB_PORT: z.preprocess(v => parseInt(v as string), z.number()),
}

const mailerDto = {
    MAILER_PASSWORD: z.string(),
    MAILER_HOST: z.string(),
    MAILER_USER: z.string(),
    MAILER_PORT: z.preprocess(data => parseInt(data as string), z.number()),
}

const cronDto = {
    CRON_CHECK_STOCK_PRODUCT: z.preprocess(data => parseInt(data as string), z.number()),
    CRON_AUTO_CANCEL_ORDER: z.preprocess(data => parseInt(data as string), z.number()),
    PENDING_ORDER_MAX_TIME: z.preprocess(data => parseInt(data as string), z.number()),
    LOW_STOCK_TRESHOLD: z.preprocess(data => parseInt(data as string), z.number()),
}

export const mainAppSchema = z.object({
    NODE_ENV: z.enum(["production", "development", "testing"]),
    NODE_HOST: z.string(),
    JWT_SECRET_KEY: z.string(),
    NODE_PORT: z.preprocess(port => parseInt(port as string), z.number()),
    ...mailerDto,
    ...mainDBDto,
    ...mailAmqpDto,
    ...sentryDto
})

export const envSchema = z.object({
    NODE_ENV: z.enum(["production", "development", "testing"]),
    NODE_HOST: z.string(),
    JWT_SECRET_KEY: z.string(),
    NODE_PORT: z.preprocess(port => parseInt(port as string), z.number()),
    ...mailerDto,
    ...mainDBDto,
    ...mailAmqpDto,
    ...cronDto,
    ...sentryDto
})

export const mailAppSchema = z.object({
    ...mailAmqpDto,
    ...mailerDto
})

export const cronAppSchema = z.object({
    ...mainDBDto
})


type EnvSchema = z.infer<typeof envSchema>

declare global {
    namespace NodeJS {
        interface ProcessEnv extends EnvSchema { }
    }
}