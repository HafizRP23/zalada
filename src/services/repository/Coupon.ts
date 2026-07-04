import db from "@database";
import * as CouponDto from "../models/Coupon";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";
import { NotFoundError, ServerError } from "../models/Common";
import moment from "moment";

export async function DBCreateCoupon(params: CouponDto.CreateCouponRequest, queryRunner?: QueryRunner) {
    const coupon = [
        [
            params.code,
            params.discount_type,
            params.discount_value,
            params.quota_total,
            params.start_at ? moment.unix(params.start_at).format('YYYY-MM-DD HH:mm:ss') : null,
            params.expired_at ? moment.unix(params.expired_at).format('YYYY-MM-DD HH:mm:ss') : null,
            params.is_active ?? 1
        ]
    ]

    const query = await db.query<ResultSetHeader>(
        `INSERT INTO coupons (code, discount_type, discount_value, quota_total, start_at, expired_at, is_active) VALUES ?`,
        [coupon],
        queryRunner
    )

    if (query.affectedRows < 1) {
        throw new ServerError("FAILED_CREATE_COUPON")
    }

    return query
}

export async function DBGetCoupons() {
    return await db.query<CouponDto.Coupon[]>(`SELECT * FROM coupons ORDER BY created_at DESC`)
}

export async function DBGetActiveCoupons() {
    return await db.query<CouponDto.Coupon[]>(`
        SELECT * FROM coupons 
        WHERE is_active = 1 
        AND quota_total > 0 
        AND (start_at IS NULL OR start_at <= NOW()) 
        AND (expired_at IS NULL OR expired_at >= NOW())
        ORDER BY created_at DESC
    `)
}

export async function DBGetCouponByCode(code: string, queryRunner?: QueryRunner) {
    const query = await db.query<CouponDto.Coupon[]>(`SELECT * FROM coupons WHERE code = ? LIMIT 1`, [code], queryRunner)
    
    if (query.length < 1) {
        throw new NotFoundError("COUPON_NOT_FOUND")
    }

    return query[0]
}

export async function DBUpdateCoupon(params: CouponDto.UpdateCouponRequest, queryRunner?: QueryRunner) {
    let updates: string[] = []
    let values: any[] = []

    if (params.is_active !== undefined) {
        updates.push("is_active = ?")
        values.push(params.is_active ? 1 : 0)
    }
    
    if (params.quota_total !== undefined) {
        updates.push("quota_total = ?")
        values.push(params.quota_total)
    }

    if (updates.length === 0) return

    values.push(params.id)

    const query = await db.query<ResultSetHeader>(
        `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`,
        values,
        queryRunner
    )

    if (query.affectedRows < 1) {
        throw new ServerError("FAILED_UPDATE_COUPON")
    }

    return query
}

export async function DBUpdateCouponQuota(id: number, reduce_by: number, queryRunner?: QueryRunner) {
    const query = await db.query<ResultSetHeader>(
        `UPDATE coupons SET quota_total = quota_total - ? WHERE id = ? AND quota_total >= ?`,
        [reduce_by, id, reduce_by],
        queryRunner
    )

    if (query.affectedRows < 1) {
        throw new ServerError("FAILED_UPDATE_COUPON_QUOTA")
    }

    return query
}

export async function DBCreateCouponUsage(params: Omit<CouponDto.CouponUsage, 'id'>, queryRunner?: QueryRunner) {
    const usage = [
        [
            params.coupon_id,
            params.user_id,
            params.order_id || null,
            params.order_no,
            params.amount_cut
        ]
    ]

    const query = await db.query<ResultSetHeader>(
        `INSERT INTO coupons_usages (coupon_id, user_id, order_id, order_no, amount_cut) VALUES ?`,
        [usage],
        queryRunner
    )

    if (query.affectedRows < 1) {
        throw new ServerError("FAILED_CREATE_COUPON_USAGE")
    }

    return query
}
