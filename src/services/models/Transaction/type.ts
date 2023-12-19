import * as z from "zod"
import { changeDeliveryStatusRequest, createOrderRequest, getOrderDetailsRequest, paymentOrderRequest, productList, transactionHistoryRequest, transactionHistoryResponse } from "./schema"

export enum TransactionStatus {
    PENDING_PAYMENT = 1,
    PENDING_APPROVAL = 2,
    PACKING = 3,
    DELIVERY = 4,
    ARRIVED = 5,
    FINISHED = 6,
    CANCEL = 7
}

export type Transaction = { order_no: string, created_at: Date, status: number, payment_type: number, verified_by: Date, payment_at: Date, shipping_at: Date, arrived_at: Date }

export type CreateOrderRequest = z.infer<typeof createOrderRequest>

export type CreateTransactionQueryParams = {
    order_no: string
    status: TransactionStatus | number
    customer_id: number
    payment_type: number
}

export type CreateTransactionDomainParams = CreateOrderRequest & {customer_id: number}

export type GetPaymentTypeQueryResult = {
    id: number
    bank_name: string
    account: string
}

export type CreateOrderQueryParams = {
    order_no: string
    product_id: number
    price: number
    quantity: number
}

export type TransactionHistoryRequest = z.infer<typeof transactionHistoryRequest>
export type TransactionHistoryResponse = z.infer<typeof transactionHistoryResponse>;
export type ProductList = z.infer<typeof productList>;

export type TransactionHistoryParams = {
    userid: number;
    status?: TransactionStatus;
}

export type TransactionHistoryResult = {
    order_no: string;
    product_id: number;
    order_time: string;
    status: number;
    customer_id: number;
    payment_type: number;
    verified_by: number;
    price: number;
    quantity: number;
}

export type PaymentOrderRequest = z.infer<typeof paymentOrderRequest>

export type CheckOrderExistQueryParams = {
    order_no: string
    status: TransactionStatus
    customer_id: number
}

type DeliveryOrderParams = {
    status: TransactionStatus.PACKING,
    order_no: string
    delivered_by: number
}

export type UpdateOrderStatusQueryParams = {
    order_no: string
    status: TransactionStatus | number
} | DeliveryOrderParams

export type CheckTransactionExistQueryParams = {
    customer_id?: number
    order_no: string
}

export type PaymentOrderDomainParams = PaymentOrderRequest & { customer_id: number }


export type GetOrderDetailsRequest = z.infer<typeof getOrderDetailsRequest>

export type GetTransactionDetailsQueryParams = {
    customer_id: number
    order_no: string
}

export type GetTransactionDetailsQueryResult = {
    product_name: string
    quantity: number
    price: number
    order_time: Date
    bank_name: string
    account: string
}


export type ChangeDeliveryStatusRequest = z.infer<typeof changeDeliveryStatusRequest>

export type ChangeDeliveryStatusDomain = ChangeDeliveryStatusRequest & {user_id: number}