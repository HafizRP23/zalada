import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/ConsumerController";
import { productSchema } from "src/services/models/Product";

const routes: RouteOptions[] = [
  {
    method: ["GET"],
    url: "/consumer/test",
    schema: {
      tags: ["Consumer Services"],
    },
    handler: (request, reply) => reply.send("Hello In Consumer"),
  },
  {
    method: ["GET"],
    url: "/products",
    schema: {
      tags: ["Consumer Services"],
      response: {
        200: productSchema("getProductsResponse")
      },
    },
    handler: ConsumerController.getProducstHandler,
  },
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}
