import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import fp from "fastify-plugin"
import { userSchemas } from "@services/models/User"
import { productSchemas } from "@services/models/Product"
import { transactionSchemas } from "@services/models/Transaction"
import { commonSchemas } from "@services/models/Common"
import { cartSchemas } from "@services/models/Cart"
import { logSchemas } from "@services/models/Log"
import { couponSchemas } from "@services/models/Coupon"

export default fp(async (server) => {
    for (const schema of [...userSchemas, ...productSchemas, ...transactionSchemas, ...commonSchemas, ...cartSchemas, ...logSchemas, ...couponSchemas]) {
        server.addSchema(schema)
    }

    await server.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Zalada APIs",
                description: "API for alls",
                version: "1.0.0",
            },
            components: {
                securitySchemes: {
                    authorization: {
                        type: "apiKey",
                        name: "authorization",
                        in: "header",
                        description: "Token for accessing endpoint"
                    }
                }
            }
        },
    })

    await server.register(fastifySwaggerUi, {
        routePrefix: "/docs",
        staticCSP: true,
        uiConfig: {
            persistAuthorization: true
        },
    })
})