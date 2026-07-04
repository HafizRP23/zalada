import { buildJsonSchemas } from "fastify-zod"
import * as z from "zod"

export const createCouponRequest = z.object({
    code: z.string().max(50),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().min(1),
    quota_total: z.number().min(1),
    start_at: z.number().optional(), // timestamp
    expired_at: z.number().optional(), // timestamp
    is_active: z.boolean().optional()
})

export const createCouponResponse = z.object({
    message: z.boolean()
})

const coupon = z.object({
    id: z.number(),
    code: z.string(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number(),
    quota_total: z.number(),
    start_at: z.number().nullable(),
    expired_at: z.number().nullable(),
    is_active: z.boolean(),
    created_at: z.number()
})

export const getCouponsResponse = z.object({
    message: z.array(coupon)
})

export const updateCouponRequest = z.object({
    id: z.number(),
    is_active: z.boolean().optional(),
    quota_total: z.number().optional()
})

export const updateCouponResponse = z.object({
    message: z.boolean()
})

export const { schemas: couponSchemas, $ref: couponSchema } = buildJsonSchemas({
    createCouponRequest,
    createCouponResponse,
    getCouponsResponse,
    updateCouponRequest,
    updateCouponResponse
}, {
    $id: "couponSchema"
})
