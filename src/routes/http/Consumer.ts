import { FastifyInstance, RouteOptions } from "fastify";
import * as ConsumerController from "src/controller/http/ConsumerController";
import { userSchema } from "src/services/models/User";
import { cartSchema } from "src/services/models/Cart";
import { productSchema } from "src/services/models/Product";
import { transactionSchema } from "src/services/models/Transaction";
import * as Auth from "src/config/auth";
import { commonSchema, baseResponse } from "src/services/models/Common";
import * as Log from "src/config/log";
import { couponSchema } from "src/services/models/Coupon";

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
    method: ["POST"],
    url: "/products/list",
    schema: {
        tags: ["Consumer Services"],
        summary: "Get Products List",
        body: productSchema("getProductListRequest"),
        response: baseResponse({ schema: commonSchema("paginationResponse") }),
    },
    handler: ConsumerController.getProductHandler,
  },
  {
    method: ["POST"],
    url: "/login",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Login",
      body: userSchema("loginRequest")
    },
    handler: ConsumerController.loginHandler
  },
  {
    method: ["POST"],
    url: "/register",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Register",
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
    preHandler: [Auth.CheckAuth, Log.ActivityLogging],
    handler: ConsumerController.createOrderHandler
  },
  {
    method: ["GET"],
    url: "/orders/payment",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Get Payment Type",
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: transactionSchema("getPaymentTypesResponse")
      })
    },
    handler: ConsumerController.getPaymentTypesHandler
  },
  {
    method: ["POST"],
    url: "/orders/payment",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Payment Order",
      body: transactionSchema("paymentOrderRequest"),
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: transactionSchema("paymentOrderResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.paymentOrderHandler
  },
  {
    method: ["POST"],
    url: "/cart",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Add Product To Carts",
      body: cartSchema("addProductToCartRequest"),
      security:[
        {
          authorization:[]
        }
      ],
      response: baseResponse({
        schema: cartSchema("addProductToCartResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.addProductToCartHandler
  },
  {
    method: ["GET"],
    url: "/orders/:order_no",
    schema: {
      tags: ["Consumer Services"],
      summary: "Get Order Information",
      security: [
        {
          authorization: []
        }
      ],
      params: transactionSchema("getOrderDetailsRequest"),
      response: baseResponse({
        schema: transactionSchema("getOrderDetailsResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.getOrderDetailsHandler
  },
  {
    method:["POST"],
    url: "/products/reviews",
    schema:{
      tags: ["Consumer Services"],
      summary: "Customer Review Product",
      security: [
        {
          authorization:[]
        }
      ],
      body: productSchema("addProductReviewRequest"),
      response:{
        200: productSchema("addProductReviewResponse")
      }
    },
    preHandler:Auth.CheckAuth,
    handler: ConsumerController.addProductReview
  },
  {
    method: ["POST"],
    url: "/orders/finish",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Finish Order",
      body: transactionSchema("finishOrderRequest"),
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: transactionSchema("finishOrderResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.finishOrderHandler
  },
  {
    method: ["GET"],
    url: "/product/:id",
    schema:{
      tags: ["Consumer Services"],
      summary: "Customer Get Product Details",
      params: productSchema("getProductDetails"),
      response: baseResponse({
        schema: productSchema("getProductDetailsResponse")
      })
    },
    handler: ConsumerController.getProductDetailsHandler
  },
  {
    method: ["DELETE"],
    url: "/cart",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Delete Product On Carts",
      body: cartSchema('deleteProductFromCartRequest'),
      security:[
        {
          authorization:[]
        }
      ],
      response: baseResponse({
        schema: cartSchema('deleteProductFromCartResponse')
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.deleteProductFromCartHandler
  },
  {
    method: ["POST"],
    url: "/orders/list",
    schema: {
      tags: ["Consumer Services"],
      summary: "Get Order List",
      body: transactionSchema("orderListRequest"),
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: commonSchema("paginationResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.orderListHandler
  },
  {
    method: ["DELETE"],
    url: "/orders/cancel",
    schema: {
      tags: ["Consumer Services"],
      summary: "Customer Cancel Order",
      body: transactionSchema("cancelOrderRequest"),
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: transactionSchema("cancelOrderResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.cancelOrderHandler
  },
  {
    method: ["GET"],
    url: "/coupons/active",
    schema: {
      tags: ["Consumer Services", "Coupons"],
      summary: "Get Active Coupons",
      security: [
        {
          authorization: []
        }
      ],
      response: baseResponse({
        schema: couponSchema("getCouponsResponse")
      })
    },
    preHandler: Auth.CheckAuth,
    handler: ConsumerController.listActiveCouponsHandler
  }
];

export default async function ConsumerRoutes(server: FastifyInstance) {
  for (const route of routes) {
    server.route({ ...route });
  }
}