import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/ConsumerController";
import { userSchema } from "src/services/models/User";
import { productSchema } from "src/services/models/Product";
import { transactionSchema } from "src/services/models/Transaction";
import * as Auth from "src/config/auth";

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
        }
    },
    handler: ConsumerController.getProductHandler,
  },
  {
    method: ["POST"],
    url: "/login",
    schema: {
      tags: ["Consumer Services"],
      body: userSchema("loginRequest")
    },
    handler: ConsumerController.loginHandler
  },
  {
    method: ["POST"],
    url: "/register",
    schema: {
      tags: ["Consumer Services"],
      body: userSchema("registerRequest"),
      response: {
        200: userSchema("registerResponse")
      }
    },
    handler: ConsumerController.registerHandler
  },
  {
    method: ["POST"],
    url: "/change-pass",
    schema: {
      tags: ["Consumer Services"],
      body: userSchema("changePassRequest"),
      security:[
        {
          authorization:[]
        }
      ],
      response: {
        200:userSchema("changePassResponse")
      }
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.changePassword
  },
  {
    method: ["POST"],
    url: "/orders",
    schema: {
      tags: ["Consumer Services"],
      body: transactionSchema("createOrderRequest"),
      summary: "Customer Create New Order",
      security: [
        {
          authorization: []
        }
      ],
      response: {
        201: transactionSchema("createOrderResponse")
      }
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.createOrderHandler
  },
  {
    method: ["GET"],
    url: "/orders/payment",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Get Payment Type",
      response: {
        200: transactionSchema("getPaymentTypesResponse")
      }
    },
    handler: ConsumerController.getPaymentTypesHandler
  },
  {
    method: ["POST"],
    url: "/transaction/order-history",
    schema: {
        tags: ["Consumer Services"],
        summary: "Customer Order History",
        security: [
          {
            authorization: []
          }
        ],
        description: "Get order history untuk customer tertentu. Dapat berdasarkan status ataupun tidak.",
        body: transactionSchema('orderHistoryRequest'),
        response: {
          200: transactionSchema('orderHistoryResponse')
        }

    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.OrderHistoryHandler,
  }
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}