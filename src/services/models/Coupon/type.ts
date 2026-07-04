import * as z from "zod"
import { createCouponRequest, updateCouponRequest } from "./schema"

export type Coupon = {
    id: number
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    quota_total: number
    start_at: number | null
    expired_at: number | null
    is_active: boolean
    created_at: number
    updated_at: number
}

export type CreateCouponRequest = z.infer<typeof createCouponRequest>

export type UpdateCouponRequest = z.infer<typeof updateCouponRequest>

export type CouponUsage = {
    id: number
    coupon_id: number
    user_id: number
    order_id?: number
    order_no: string
    amount_cut: number
}
