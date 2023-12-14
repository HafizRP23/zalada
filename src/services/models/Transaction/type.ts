import { productList, orderHistoryRequest, orderHistoryResponse } from "./schema";
import * as z from "zod";

export type OrderHistoryRequest = z.infer<typeof orderHistoryRequest>
export type OrderHistoryResponse = z.infer<typeof orderHistoryResponse>;
export type ProductList = z.infer<typeof productList>;

export enum TransactionStatus {
    PENDING_PAYMENT = 1,
    PENDING_APPROVAL = 2,
    PACKING = 3,
    DELIVERY = 4,
    ARRIVED = 5,
    FINISHED = 6,
    CANCEL = 7
}

export type OrderHistoryParams = {
    userid: number;
    status?: TransactionStatus;
}

export type OrderHistoryResult = {
    order_no: string;
    product_id: number;
    order_time: string;
    status: number;
    payment_type: number;
    price: number;
    quantity: number;
}