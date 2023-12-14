import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/ConsumerController";
import { transactionSchema } from "src/services/models/Transaction"; 

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
    url: "/transaction/order-history",
    schema: {
        tags: ["Consumer Services"],
        description: "Get order history untuk customer tertentu. Dapat berdasarkan status ataupun tidak.",
        body: transactionSchema('orderHistoryRequest'),
        response: {
          200: transactionSchema('orderHistoryResponse')
        }

    },
    handler: ConsumerController.OrderHistoryHandler,
  }
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}