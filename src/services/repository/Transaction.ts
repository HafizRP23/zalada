import db from "@database";
import * as TransactionDto from "../models/Transaction";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";
import { NotFoundError, ServerError } from "src/config/error";


export async function DBCreateTransaction({ customer_id, order_no, payment_type, status }: TransactionDto.CreateTransactionQueryParams, queryRunner?: QueryRunner) {
    const transaction = [
        [order_no, status, customer_id, payment_type]
    ]

    const query = await db.query<ResultSetHeader>(`INSERT INTO transactions (order_no, status, customer_id, payment_type) VALUES ?`, [transaction], queryRunner)
    
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

export async function DBCreateOrder({order_no, price, product_id, quantity}: TransactionDto.CreateOrderQueryParams, queryRunner?: QueryRunner) {
    const order = [
        [order_no, product_id, price, quantity]
    ]

    const query = await db.query<ResultSetHeader>(`INSERT INTO orders (order_no, product_id, price, quantity) VALUES ?`, [order], queryRunner)

    if(query.affectedRows < 1) {
        throw new ServerError("FAILED_CREATE_ORDER")
    }

    return query
}

export async function DBTransactionHistory(params: TransactionDto.TransactionHistoryParams) {
  const transactionHistory = await db.query<TransactionDto.TransactionHistoryResult[]>(`SELECT t.status, t.customer_id, t.payment_type, t.verified_by, t.order_time, o.order_no, o.product_id, o.price, o.quantity FROM transactions t INNER JOIN orders o ON t.order_no = o.order_no WHERE t.customer_id = ? ${params.status ? `AND t.status = ${params.status}`: ''}`, [params.userid]);

  return transactionHistory;
}

export async function DBCheckOrderExist({order_no, status, customer_id}: TransactionDto.CheckOrderExistQueryParams) {
    const query = await db.query<Array<{order_no: number, status: number, quantity: number, price: number}>>(`SELECT t.order_no, t.status, t.quantity, p.price FROM transactions t LEFT JOIN products p ON p.id = product_id WHERE t.order_no = ? AND t.status = ? AND t.customer_id = ?`, [order_no, status, customer_id])
    return query
}

export async function DBUpdateTransactionStatus(params: TransactionDto.UpdateOrderStatusQueryParams, queryRunner?: QueryRunner) {
    const { order_no, status } = params
    let query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ? WHERE order_no = ?`, [status, order_no], queryRunner)

    if (status == 2) {
        // Update status after payment
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, payment_at = ? WHERE order_no = ?`, [status, new Date().toISOString(), order_no], queryRunner)
    } else if (status == 4 && "delivered_by" in params) {
        // Update status on shipping
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, shipping_at = ?, delivered_by = ? WHERE order_no = ?`, [status, new Date().toISOString(), params.delivered_by, order_no], queryRunner)
    } else if (status == 5) {
        // Update status on arrived
        query = await db.query<ResultSetHeader>(`UPDATE transactions SET status = ?, arrived_at = ? WHERE order_no = ?`, [status, new Date().toISOString(), order_no], queryRunner)
    }


    if(query.affectedRows < 1) {
      throw new ServerError("FAILED_UPDATE_TRANSACTION_STATUS")
    }

    return query
}

export async function DBCheckTransactionExist({ customer_id = 0, order_no }: TransactionDto.CheckTransactionExistQueryParams) {
    let query = await db.query<TransactionDto.Transaction[]>(`SELECT t.order_no, t.created_at, t.status, t.payment_type, t.verified_by, t.payment_at, t.shipping_at, t.arrived_at FROM transactions t WHERE t.order_no = ?`, [order_no])

    if(customer_id > 0) {
        query = await db.query<TransactionDto.Transaction[]>(`SELECT t.order_no, t.created_at, t.status, t.payment_type, t.verified_by, t.payment_at, t.shipping_at, t.arrived_at FROM transactions t WHERE t.customer_id = ? AND t.order_no = ?`, [customer_id, order_no])
    }

    if (query.length < 1) {
        throw new NotFoundError("TRANSACTION_NOT_FOUND")
    }

    return query[0]
}
export async function DBGetOrders(order_no: string) {
  return await db.query<Array<{ product_name: string, price: number, quantity: number }>>(`SELECT p.name product_name, o.price, o.quantity FROM orders o LEFT JOIN products p ON p.id = o.product_id WHERE o.order_no = ?`, [order_no])
}

export async function DBCheckPaymentTypeExist(payment_type: number) {
    const query = await db.query<Array<{ id: number, bank_name: string, account: string }>>(`SELECT id, bank_name, account FROM banks WHERE id = ?`, [payment_type])

    if (query.length < 1) {
        throw new NotFoundError("PAYMENT_TYPE_NOT_FOUND")
    }

    return query[0]
}
