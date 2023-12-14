import * as TransactionRepository from "../repository/Transaction";
import * as TransactionDto from "../models/Transaction";
import * as ProductRepository  from "../repository/Product"
import { RequestError } from "src/config/error";
import db from "@database"

export async function getPaymentTypesDomain() {
    return await TransactionRepository.DBGetPaymentTypes()
}

export async function createTransactionDomain({customer_id, order, payment_type}: TransactionDto.CreateTransactionDomainParams) {
    const order_no = `ORD/${customer_id}/${Date.now()}`
    let stock: Record<string, number> | number = {}
    let total_price = 0

    const queryRunner = db.createQueryRunner()
    await queryRunner.connect()
    try {
        await queryRunner.startTransaction()

        await TransactionRepository.DBCheckPaymentExist(payment_type)

        if(Array.isArray(order)) {
            for (const item of order) {
                // Check product exists
                const product = await ProductRepository.DBCheckProductExist(item.product_id)

                // Check quantity is more than product stock
                if (product.stock < item.quantity) {
                    throw new RequestError(`${product.name.split(" ").join("_").toUpperCase()}_EXCEEDS_STOCK`)
                }

                stock[product.name] = product.stock - item.quantity

                total_price += product.price * item.quantity

                await TransactionRepository.DBCreateOrder({ order_no, price: product.price, quantity: item.quantity, product_id: product.id }, queryRunner)

                // Update product stock after transaction has been created
                await ProductRepository.DBUpdateStockProduct({ product_id: product.id, stock: product.stock - item.quantity }, queryRunner)   
            }
        } else {
            // Check product exists
            const product = await ProductRepository.DBCheckProductExist(order.product_id)

            // Check quantity is more than product stock
            if (product.stock < order.quantity) {
                throw new RequestError(`${product.name.split(" ").join("_").toUpperCase()}_EXCEEDS_STOCK`)
            }

            total_price += product.price * order.quantity

            stock = product.stock - order.quantity

            await TransactionRepository.DBCreateOrder({ order_no, price: product.price, quantity: order.quantity, product_id: product.id }, queryRunner)

            // Update product stock after transaction has been created
            await ProductRepository.DBUpdateStockProduct({ product_id: product.id, stock: product.stock - order.quantity }, queryRunner)   
        }

        await TransactionRepository.DBCreateTransaction({order_no, customer_id, payment_type, status: 1}, queryRunner)

        return { order_no, total_price, stock }
    } catch (error) {
        await queryRunner.rollbackTransaction()
        throw error
    } finally {
        await queryRunner.release()
    }
}

export async function TransactionHistoryDomain(params: TransactionDto.TransactionHistoryParams) {
    const transactionHistory = await TransactionRepository.DBTransactionHistory(params);

    if (transactionHistory.length < 1) {
        throw new Error("NO_TRANSACTIONS_FOUND")
    }

    const result: TransactionDto.TransactionHistoryResponse = {}

    for (const item of transactionHistory) {
        if (!result[item.order_no]) {
            result[item.order_no] = {
                order_no: item.order_no,
                product: [],
                status: item.status,
                customer_id: item.customer_id,
                payment_type: item.payment_type,
                order_time: item.order_time,
                verified_by: item.verified_by
            }
        }

        result[item.order_no].product.push({
            product_id: item.product_id,
            price: item.price,
            quantity: item.quantity
        })
    }

    return result;
}

export async function confirmOrderDomain({order_no, user_id}: TransactionDto.ConfirmOrderDomain) {
    // Check order exist

    // const transaction = await TransactionRepository.

    // Update order to packing
}