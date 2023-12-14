import { buildJsonSchemas } from "fastify-zod"
import * as z from "zod"

const createOrder = z.object({
    product_id: z.number(),
    quantity: z.number().min(1)
})

const createOrders = z.array(createOrder)

export const createOrderRequest = z.object({
    order: z.union([createOrder, createOrders]),
    payment_type: z.number(),
})

export const createOrderResponse = z.object({
    message: z.object({
        order_no: z.string(),
        total_price: z.number(),
        stock: z.union([z.number(), z.record(z.string(), z.number())])
    })
})

const getPaymentType = z.object({
    id: z.number(),
    bank_name: z.string(),
    account: z.string()
})

export const getPaymentTypesResponse = z.object({
    message: z.array(getPaymentType)
})

export const orderHistoryRequest = z.object({
    status: z.number().min(1).optional().describe(`1 = PENDING_PAYMENT, 2 = PENDING_APPROVAL, 3 = PACKING, 4 = DELIVERY, 5 = ARRIVED, 6 = FINISHED, 7 = CANCEL`)
  });

export const productList = z.object({
  product_name: z.string(),
  price: z.number(),
  quantity: z.number()
})

export const orderHistoryResponse = z.object({
    order_no: z.string(),
    items: z.array(productList),
    status: z.number(),
    total_price: z.number()
}).array()

export const { schemas: transactionSchemas, $ref: transactionSchema } = buildJsonSchemas({
    createOrderRequest,
    createOrderResponse,
    getPaymentTypesResponse,
    orderHistoryRequest,
    productList,
    orderHistoryResponse
}, {
    $id: "transactionSchemas"
})