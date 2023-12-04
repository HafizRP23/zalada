import { buildJsonSchemas } from "fastify-zod";
import { type } from "os";
import * as z from "zod";

const getProductRequest = z.object({
  product_id: z.number(),
});


const orderProductRequest = z.object({
  name: z.string(),
  quantity: z.number()
})

export type orderProductRequest = z.infer<typeof orderProductRequest>

export type GetProductRequest = z.infer<typeof getProductRequest>

export const { schemas: productSchemas, $ref: productSchema } = buildJsonSchemas(
    {
      getProductRequest,
    },
    {
      $id: "productSchema",
    }
  );
