import db from "@database";
import * as TransactionDto from "../models/Transaction";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";
import { NotFoundError, ServerError } from "../models/Common";
import moment from "moment";


export async function DBCreateTransaction({ customer_id, order_no, payment_type, status, address, notes }: TransactionDto.CreateTransactionQueryParams, queryRunner?: QueryRunner) {
    const transaction = [
        [order_no, status, customer_id, payment_type, moment().unix(), address, notes]
    ]

    const query = await db.query<ResultSetHeader>(`INSERT INTO transactions (order_no, status, customer_id, payment_type, created_at, address, notes) VALUES ?`, [transaction], queryRunner)
    
    if(query.affectedRows < 1) {
        throw new ServerError("FAILED_CREATE_TRANSACTION")
    }

    return query   
}

export async function DBCheckPaymentExist(payment_type: number) {
    const query = await db.query<Array<{id: number}>>(`SELECT id FROM banks WHERE id = ?`, [payment_type])

    if(query.length < 1) {
        throw new NotFoundError("PAYMENT_TYPE_NOT_FOUND")
    }

    return query[0]
}

export async function DBGetPaymentTypes() {
    return await db.query<TransactionDto.GetPaymentTypeQueryResult[]>(`SELECT id, bank_name, account FROM banks`)
}

export async function DBCreateOrder({order_no, price, price_after_discount, product_id, quantity}: TransactionDto.CreateOrderQueryParams, queryRunner?: QueryRunner) {
    const order = [
        [order_no, product_id, price, price_after_discount, quantity]
    ]

    const query = await db.query<ResultSetHeader>(`INSERT INTO orders (order_no, product_id, price, price_after_discount, quantity) VALUES ?`, [order], queryRunner)

    if(query.affectedRows < 1) {
        throw new ServerError("FAILED_CREATE_ORDER")
    }

    return query
}

export async function DBTransactionList({ limit = 500, search = "1=1", sort = "DESC" }: TransactionDto.TransactionListQueryParams) {
    return await db.query<TransactionDto.TransactionListResult[]>(`SELECT
    t.no,
    CASE
        WHEN (t.status = 1) THEN 'Pending Payment'
        WHEN (t.status = 2) THEN 'Pending Approval'
        WHEN (t.status = 3) THEN 'On Packing'
        WHEN (t.status = 4 AND t.delivered_by IS NULL AND t.shipping_at IS NULL) THEN 'Ready To Shipping'
        WHEN (t.status = 4 AND t.delivered_by IS NOT NULL AND t.shipping_at IS NOT NULL) THEN 'On Shipping'
        WHEN (t.status = 5) THEN 'Order Already Arrived'
        WHEN (t.status = 6) THEN 'Orders Confirmed By Customer'
        WHEN (t.status = 7) THEN 'Cancelled'
        ELSE 'Transaction Status Not Tracked On System'
    END status, 
    t.order_no, 
        u.username, vb.username verified_by, b.bank_name payment_type, db.username delivered_by,
        t.created_at, t.payment_at, t.shipping_at, t.arrived_at 
    FROM (
        SELECT ROW_NUMBER() OVER (
            ORDER BY tr.order_no
        ) no, tr.* FROM transactions tr
    ) t
    LEFT JOIN banks b ON b.id = t.payment_type
    LEFT JOIN users u ON u.id = t.customer_id
    LEFT JOIN users vb ON vb.id = t.verified_by
    LEFT JOIN users db ON db.id = t.delivered_by
    WHERE ${search} ORDER BY t.created_at ${sort} LIMIT ${limit + 1}`)
}

export async function DBGetOrders(order_no: string) {
    return await db.query<TransactionDto.ProductList[]>(`SELECT p.id product_id, p.name as product_name, o.price, o.quantity FROM orders o LEFT JOIN products p ON p.id = o.product_id WHERE o.order_no = ?`, [order_no])
}

export async function DBCheckOrderExist({order_no, status, customer_id}: TransactionDto.CheckOrderExistQueryParams) {
    const query = await db.query<Array<{order_no: number, status: number, quantity: number, price: number}>>(`SELECT t.order_no, t.status, t.quantity, p.price FROM transactions t LEFT JOIN products p ON p.id = product_id WHERE t.order_no = ? AND t.status = ? AND t.customer_id = ?`, [order_no, status, customer_id])
    return query
}

export async function DBUpdateTransactionStatus(params: TransactionDto.UpdateOrderStatusQueryParams, queryRunner?: QueryRunner) {
    let query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ? WHERE order_no = ?`, [params.status, params.order_no], queryRunner)

    if (params.status == 2) {
        // Update status after payment
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, payment_at = ? WHERE order_no = ?`, [params.status, moment().unix(), params.order_no], queryRunner)
    } else if (params.status == 3 && "verified_by" in params) {
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, verified_by = ? WHERE order_no = ?`, [params.status, params.verified_by, params.order_no], queryRunner)
    } else if (params.status == 4 && "delivered_by" in params) {
        // Update status on shipping
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, delivered_by = ?, shipping_at = ? WHERE order_no = ?`, [params.status, params.delivered_by, moment().unix(), params.order_no], queryRunner)
    } else if (params.status == 5) {
        // Update status on arrived
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, arrived_at = ? WHERE order_no = ?`, [params.status, moment().unix(), params.order_no], queryRunner)
    }


    if(query.affectedRows < 1) {
      throw new ServerError("FAILED_UPDATE_TRANSACTION_STATUS")
    }

    return query
}

export async function DBCheckTransactionExist({ order_no }: TransactionDto.CheckTransactionExistQueryParams) {
    const query = await db.query<TransactionDto.Transaction[]>(`
        SELECT t.order_no, t.created_at, t.status, CONCAT_WS(' ', u.first_name, u.last_name) customer_name, CONCAT_WS(' ', vb.first_name, vb.last_name) verified_by,
        b.bank_name payment_type, b.bank_name payment_type, t.delivered_by, t.shipping_at, t.arrived_at, t.payment_at, t.notes, t.address
        FROM transactions t
        LEFT JOIN banks b ON b.id = t.payment_type
        LEFT JOIN users u ON u.id = t.customer_id
        LEFT JOIN users vb ON vb.id = t.verified_by
        WHERE t.order_no = ?
        `, [order_no])

    if (query.length < 1) {
        throw new NotFoundError("TRANSACTION_NOT_FOUND")
    }

    return query[0]
}

export async function DBCheckPaymentTypeExist(payment_type: number) {
    const query = await db.query<Array<{ id: number, bank_name: string, account: string }>>(`SELECT id, bank_name, account FROM banks WHERE id = ?`, [payment_type])

    if (query.length < 1) {
        throw new NotFoundError("PAYMENT_TYPE_NOT_FOUND")
    }

    return query[0]
}

export async function DBCheckPendingTransaction(order_no: string) {
    const query = await db.query<TransactionDto.Transaction[]>(`SELECT * FROM transactions WHERE order_no = ? AND status IN (1, 2)`, [order_no])

    if(query.length < 1) {
        throw new NotFoundError("PENDING_TRANSACTION_NOT_FOUND")
    }

    return query[0]
}
export async function DBSetDeliveryOrder(order_no: string) {
    const query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ? WHERE order_no = ?`, [4, order_no])

    if(query.affectedRows < 1) {
        throw new ServerError("FAILED_TO_SET_DELIVERY_ORDER")
    }

    return query
}

export async function DBCheckTransactionArrived({ order_no, delivered_by }: TransactionDto.CheckTransactionArrivedQueryParams) {
    const query = await db.query<TransactionDto.Transaction[]>(`SELECT t.order_no, t.created_at, t.status, t.payment_type, t.verified_by, t.payment_at, t.shipping_at, t.arrived_at FROM transactions t WHERE t.status = 4 AND t.order_no = ? AND t.delivered_by = ? AND t.shipping_at IS NOT NULL`, [order_no, delivered_by])

    if(query.length < 1) {
        throw new NotFoundError("TRANSACTION_NOT_FOUND")
    }

    return query[0]
}

export async function DBCheckTransactionDelivery(order_no: string) {
    const query = await db.query<TransactionDto.Transaction[]>(`SELECT t.order_no, t.created_at, t.status, t.payment_type, t.verified_by, t.payment_at, t.shipping_at, t.arrived_at FROM transactions t WHERE t.status = 4 AND t.order_no = ? AND t.delivered_by IS NULL AND t.shipping_at IS NULL`, [order_no])

    if(query.length < 1) {
        throw new NotFoundError("TRANSACTION_NOT_FOUND")
    }

    return query[0]
}

export async function DBGetDeliveryReadyList() {
    return await db.query<Array<{ order_no: string, address: string, phone_number: string, fullname: string }>>(`
        SELECT t.order_no, t.address, u.phone_number, CONCAT_WS(' ', u.first_name, u.last_name) fullname
        FROM transactions t
        LEFT JOIN users u ON u.id = t.customer_id 
        WHERE status = 4 AND delivered_by IS NULL AND shipping_at IS NULL
        ORDER BY t.created_at DESC
    `)
}

export async function DBGetOnDeliveryList(delivered_by: number) {
    return await db.query<Array<{ order_no: string, address: string, phone_number: string, fullname: string }>>(`
        SELECT t.order_no, t.address, u.phone_number, CONCAT_WS(' ', u.first_name, u.last_name) fullname
        FROM transactions t
        LEFT JOIN users u ON u.id = t.customer_id 
        WHERE status = 4 AND delivered_by = ? AND shipping_at IS NOT NULL
        ORDER BY t.created_at DESC
    `, [delivered_by])
}


export async function DBCustomerTransactionList({ limit = 500, search = "1=1", sort = "DESC", customer_id }: TransactionDto.CustomerTransactionListQueryParams) {
    return await db.query<TransactionDto.CustomerTransactionListQueryResult[]>(`
    SELECT
    t.no,
    CASE
        WHEN (t.status = 1) THEN 'Pending Payment'
        WHEN (t.status = 2) THEN 'Pending Approval'
        WHEN (t.status = 3) THEN 'On Packing'
        WHEN (t.status = 4 AND t.delivered_by IS NULL AND t.shipping_at IS NULL) THEN 'Ready To Shipping'
        WHEN (t.status = 4 AND t.delivered_by IS NOT NULL AND t.shipping_at IS NOT NULL) THEN 'On Shipping'
        WHEN (t.status = 5) THEN 'Order Already Arrived'
        WHEN (t.status = 6) THEN 'Orders Confirmed By Customer'
        WHEN (t.status = 7) THEN 'Cancelled'
        ELSE 'Transaction Status Not Tracked On System'
    END status,
    t.order_no, u.username, b.bank_name payment_type, t.created_at, t.payment_at ,t.shipping_at, t.arrived_at
    FROM (
        SELECT ROW_NUMBER() OVER (
            ORDER BY tr.order_no
        ) no, tr.* FROM transactions tr
    ) t
    LEFT JOIN banks b ON b.id = t.payment_type
    LEFT JOIN users u ON u.id = t.customer_id
    WHERE t.customer_id = ? AND ${search} ORDER BY t.created_at ${sort} LIMIT ${limit + 1}
    `, [customer_id])
}

export async function DBConfirmedOrderList() {
    const query = await db.query<TransactionDto.ConfirmedOrderListQueryResult[]>(`
        SELECT t.order_no, t.address, u.phone_number, CONCAT_WS(' ', u.first_name, u.last_name) fullname
        FROM transactions t
        LEFT JOIN users u ON u.id = t.customer_id 
        WHERE status = 3
        ORDER BY t.payment_at DESC
    `)

    return query
}

export async function DBCheckCustomerTransactionExist({ customer_id, order_no }: TransactionDto.CheckCustomerTransactionExistQueryParams) {
    const query = await db.query<TransactionDto.Transaction[]>(`
        SELECT t.order_no, t.created_at, t.status, b.bank_name payment_type, t.verified_by, t.delivered_by, t.payment_at, t.shipping_at, t.arrived_at, t.notes, t.address
        FROM transactions t
        LEFT JOIN banks b ON b.id = t.payment_type
        WHERE t.customer_id = ? AND t.order_no = ?
        `, [customer_id, order_no])

    if(query.length < 1) {
        throw new NotFoundError("TRANSACTION_NOT_FOUND")
    }

    return query[0]
}