import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/ConsumerController";
import { productSchema } from "src/services/models/Product";
import { Schema, number, string } from "zod";

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
    url: "/product/order",
    schema: {
      tags: ["Consumer Services"],
      body: {
        object:{
          name: string,
        quantity: number
        }
      },
    },
    handler: ConsumerController.orderProductHandler,
  },
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}
