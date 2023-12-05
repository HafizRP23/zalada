import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/ConsumerController";

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
        tags: ["Consumer Services"]
    },
    handler: ConsumerController.getProducstHandler,
  },
  {
    method: ["POST"],
    url: "/order/customer-order-history-by-delivery-status",
    schema: {
        tags: ["Consumer Services"],
        body: {
          type: 'object',
          properties: {
            status :{
              type: 'string'
            }
          }
        }
    },
    handler: ConsumerController.CustomerOrderHistoryByDeliveryStatusHandler,
  }
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}
