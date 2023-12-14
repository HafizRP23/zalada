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

export async function DBOrderHistory(params: TransactionDto.OrderHistoryParams) {
  const orderHistory = await db.query<TransactionDto.OrderHistoryResult[]>(`SELECT t.status, t.order_no FROM transactions t INNER JOIN orders o ON t.order_no = o.order_no WHERE t.customer_id = ? ${params.status ? `AND t.status = ${params.status}`: ''} GROUP BY t.order_no ORDER BY t.order_time ASC`, [params.userid]);

  return orderHistory;
}

export async function DBGetOrders(order_no: string) {
    return await db.query<TransactionDto.ProductList[]>(`SELECT p.name as product_name, o.price, o.quantity FROM orders o LEFT JOIN products p ON p.id = o.product_id WHERE o.order_no = ?`, [order_no])
}
