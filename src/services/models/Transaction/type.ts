import * as z from "zod"
import { confirmOrderRequest, changeDeliveryStatusRequest, createOrderRequest, finishOrderRequest, getOrderDetailsRequest, paymentOrderRequest, getTransactionListRequest, productList, setArrivedSchema, setDeliveryRequest, transactionListResponse, orderListRequest, cancelOrderRequest, transactionDetailsRequest } from "./schema"

export enum TransactionStatus {
    PENDING_PAYMENT = 1,
    PENDING_APPROVAL = 2,
    PACKING = 3,
    DELIVERY = 4,
    ARRIVED = 5,
    FINISHED = 6,
    CANCEL = 7
}

export type Transaction = { 
    order_no: string, 
    created_at: number, 
    status: number, 
    payment_type: string, 
    delivered_by: number, 
    verified_by: string, 
    payment_at: number, 
    shipping_at: number, 
    arrived_at: number, 
    address: string
    notes?: string
}

export type CreateOrderRequest = z.infer<typeof createOrderRequest>

export type CreateTransactionQueryParams = {
    order_no: string
    status: TransactionStatus | number
    customer_id: number
    payment_type: number
    address: string
    notes?: string
}

export type CreateTransactionDomainParams = CreateOrderRequest & {
    customer_id: number
    coupon_code?: string
}

export type GetPaymentTypeQueryResult = {
    id: number
    bank_name: string
    account: string
}

export type CreateOrderQueryParams = {
    order_no: string
    product_id: number
    price: number
    price_after_discount: number
    quantity: number
}

export type TransactionListResult = {
    no: number
    order_no: string;
    status: number;
    customer_id: number;
    order_time: string;
    payment_type: string;
    verified_by: number;
    product_id: number;
    price: number;
    quantity: number;
}

export type PaymentOrderRequest = z.infer<typeof paymentOrderRequest>

export type CheckOrderExistQueryParams = {
    order_no: string
    status: TransactionStatus
    customer_id: number
}

export type ConfirmOrderUpdate = {
    status: TransactionStatus.PACKING | 3
    order_no: string
    verified_by: number
}

type DeliveryOrderParams = {
    status: TransactionStatus.PACKING,
    order_no: string
    delivered_by: number
}

export type UpdateOrderStatusQueryParams = {
    order_no: string
    status: TransactionStatus | number
} | ConfirmOrderUpdate | DeliveryOrderParams

export type CheckTransactionExistQueryParams = {
    order_no: string
}

export type PaymentOrderDomainParams = PaymentOrderRequest & { customer_id: number, email: string, username: string }


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

export type ConfirmOrderRequest = z.infer<typeof confirmOrderRequest>

export type ConfirmOrderDomain = ConfirmOrderRequest & { user_id: number }

export type ChangeDeliveryStatusRequest = z.infer<typeof changeDeliveryStatusRequest>

export type ChangeDeliveryStatusDomain = ChangeDeliveryStatusRequest & {user_id: number}

export type SetDeliveryRequest = z.infer<typeof setDeliveryRequest>

export type SetDeliveryOrderDomainParams = SetDeliveryRequest

export type SetArrivedRequest = Pick<z.infer<typeof setArrivedSchema>, 'order_no'>

export type SetArrivedDomain = z.infer<typeof setArrivedSchema> & { delivered_by: number}

export type CheckTransactionArrivedQueryParams = {
    order_no: string,
    delivered_by: number
}

export type CheckTransactionDeliveryQueryParams = {
    order_no: string
    delivered_by: number
}

export type FinishOrderRequest = z.infer<typeof finishOrderRequest>

export type finishOrderDomain = FinishOrderRequest & { customer_id: number }

export type TransactionListResponse = z.infer<typeof transactionListResponse>;
export type ProductList = z.infer<typeof productList>;

export type TransactionListQueryParams = {
    limit?: number
    sort?: string
    search?: string
}

export type TransactionListRequest = z.infer<typeof getTransactionListRequest>

export type TransactionListDomain = TransactionListRequest

export type OnDeliveryListDomain = {
    delivered_by: number
}

export type OrderListRequest = z.infer<typeof orderListRequest>

export type CustomerTransactionListDomain = OrderListRequest & { customer_id: number }

export type CustomerTransactionListQueryParams = {
    sort?: string
    limit?: number
    search?: string
    customer_id: number
}

export type CustomerTransactionListQueryResult = {
    no: number
    status: string
    order_no: string
    username: string
    payment_type: string
    payment_at: number
    created_at: number
    shipping_at: number
    arrived_at: number
}

export type CancelOrderRequest = z.infer<typeof cancelOrderRequest>

export type CancelOrderDomain = CancelOrderRequest & {customer_id: number}

export type ConfirmedOrderListQueryResult = Pick<Transaction, 'order_no'> & {
    fullname: string
    address: string
    phone_number: string
}

export type CheckCustomerTransactionExistQueryParams = {
    customer_id: number
    order_no: string
}

export type TransactionDetailsRequest = z.infer<typeof transactionDetailsRequest>

export type TransactionDetailsDomain = TransactionDetailsRequest