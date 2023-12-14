import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";

export const baseSchema = {
    id: z.number(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    stock: z.number(),
    // created_at: z.date(),
    store_id: z.number()
}

export const getProductRequest = z.object({
    product_id: z.number(),
});

export const getProductResponse = z.object({ ...baseSchema })

export const addProductsResponse = z.object({ message:z.boolean() })

export const getProductsResponse = z.array(getProductResponse)

export const addProductsRequest = z.object({
    name: z.string(),
    quantity: z.number(),
    description: z.number(),
    price: z.number()
})

const addProductsSchema = z.object({
    name:z.string(),
    stock:z.number(),
    description:z.string(),
    price:z.number()
})


export const updateProductRequest = z.object({
    product_id: z.number(),
    name: z.string(),
    stock: z.number(),
    price: z.number(),
    description: z.string(),
})

export const updateProductResponse = z.object({
    message: z.boolean()
})

export const { schemas: productSchemas, $ref: productSchema } = buildJsonSchemas(
    {
        getProductRequest,
        getProductResponse,
        getProductsResponse,
        addProductsSchema,
        addProductsRequest,
        addProductsResponse,
        updateProductRequest,
        updateProductResponse
    },
    {
        $id: "productSchema",
    }
);
