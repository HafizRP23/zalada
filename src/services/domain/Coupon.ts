import * as CouponRepository from "../repository/Coupon"
import * as CouponDto from "../models/Coupon"
import { RequestError } from "../models/Common"
import moment from "moment"

export async function createCouponDomain(params: CouponDto.CreateCouponRequest) {
    try {
        await CouponRepository.DBGetCouponByCode(params.code)
        throw new RequestError("COUPON_CODE_ALREADY_EXISTS")
    } catch (e: any) {
        if (e.message !== "COUPON_NOT_FOUND") {
            throw e
        }
    }

    if (params.start_at && params.expired_at && params.start_at >= params.expired_at) {
        throw new RequestError("INVALID_DATE_RANGE")
    }

    await CouponRepository.DBCreateCoupon(params)
    return true
}

export async function listCouponsDomain() {
    return await CouponRepository.DBGetCoupons()
}

export async function listActiveCouponsDomain() {
    return await CouponRepository.DBGetActiveCoupons()
}

export async function updateCouponDomain(params: CouponDto.UpdateCouponRequest) {
    await CouponRepository.DBUpdateCoupon(params)
    return true
}

export async function validateCouponDomain(code: string) {
    const coupon = await CouponRepository.DBGetCouponByCode(code)
    
    if (!coupon.is_active) {
        throw new RequestError("COUPON_IS_INACTIVE")
    }
    
    if (coupon.quota_total <= 0) {
        throw new RequestError("COUPON_QUOTA_EXCEEDED")
    }
    
    const now = moment().unix()
    
    if (coupon.start_at && now < moment(coupon.start_at).unix()) {
        throw new RequestError("COUPON_NOT_STARTED_YET")
    }
    
    if (coupon.expired_at && now > moment(coupon.expired_at).unix()) {
        throw new RequestError("COUPON_EXPIRED")
    }
    
    return coupon
}
