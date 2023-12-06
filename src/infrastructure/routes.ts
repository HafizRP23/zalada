import fastifyPlugin from 'fastify-plugin'
import AdminRoutes from '../routes/Admin'
import ConsumerRoutes from '../routes/Consumer'
import StaffRoutes from '../routes/Staff'
import fastifyHelmet from "@fastify/helmet";
import fastifyFormBody from "@fastify/formbody";
import fastifyMulter from "fastify-multer";

export default fastifyPlugin(async (server) => {
    await server.register(fastifyFormBody)
    await server.register(fastifyHelmet) 
    await server.register(fastifyMulter.contentParser)
    await server.register(ConsumerRoutes)
    await server.register(StaffRoutes)
    await server.register(AdminRoutes, { prefix: "/admin" })
   
})