import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";


export const orderHistoryRequest = z.object({
  status: z.number().min(1).optional().describe(`1 = PENDING_PAYMENT, 2 = PENDING_APPROVAL, 3 = PACKING, 4 = DELIVERY, 5 = ARRIVED, 6 = FINISHED, 7 = CANCEL`)
});

export const productList = z.object({
  product_id: z.number(),
  price: z.number(),
  quantity: z.number()
})

export const orderHistoryResponse = z.record(z.string(), z.object({
  order_no: z.string(),
  product: z.array(productList),
  order_time: z.string(),
  status: z.number(),
  payment_type: z.number(),
  total_price: z.number()
}))





export const { schemas: transactionSchemas, $ref: transactionSchema } = buildJsonSchemas(
    {
      orderHistoryRequest,
      orderHistoryResponse
    },
    {
      $id: "transactionSchema",
    }
  );