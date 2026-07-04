import * as TransactionRepository from "../repository/Transaction";
import * as CouponDomain from "./Coupon";
import * as CouponRepository from "../repository/Coupon";
import * as TransactionDto from "../models/Transaction";
import * as ProductRepository from "../repository/Product"
import * as CommonRepository from "../repository/Common"
import { RequestError } from "../models/Common";
import db from "@database"
import format from "format-unicorn/safe"
import moment from "moment"
import mailer from "@infrastructure/Common/mailer";

export async function getPaymentTypesDomain() {
    return await TransactionRepository.DBGetPaymentTypes()
}

export async function createTransactionDomain({customer_id, order, payment_type, address, notes, coupon_code}: TransactionDto.CreateTransactionDomainParams) {
    const order_no = `ORD/${customer_id}/${moment().unix()}`
    let stock: Record<string, number> | number = {}
    let total_price = 0

    const queryRunner = db.createQueryRunner()
    await queryRunner.connect()
    try {
        await queryRunner.startTransaction()

        await TransactionRepository.DBCheckPaymentExist(payment_type)
        
        let coupon: any = null
        if (coupon_code) {
            coupon = await CouponDomain.validateCouponDomain(coupon_code)
        }

        const items = Array.isArray(order) ? order : [order]
        const orderItems = []

        for (const item of items) {
            // Check product exists
            const product = await ProductRepository.DBCheckProductExist(item.product_id, { lock: true })

            // Check quantity is more than product stock
            if (product.stock < item.quantity) {
                throw new RequestError(`${product.name.split(" ").join("_").toUpperCase()}_EXCEEDS_STOCK`)
            }

            if (Array.isArray(order)) {
                if (typeof stock === 'number') stock = {}
                stock[product.name] = product.stock - item.quantity
            } else {
                stock = product.stock - item.quantity
            }

            const itemTotalPrice = product.price * item.quantity
            total_price += itemTotalPrice
            
            orderItems.push({
                product_id: product.id,
                price: product.price,
                quantity: item.quantity,
                itemTotalPrice,
                product
            })
        }
        
        let totalDiscount = 0
        if (coupon) {
            if (coupon.discount_type === 'percentage') {
                totalDiscount = (total_price * coupon.discount_value) / 100
            } else if (coupon.discount_type === 'fixed') {
                totalDiscount = coupon.discount_value
            }
            if (totalDiscount > total_price) {
                totalDiscount = total_price
            }
        }
        
        for (const item of orderItems) {
            let itemDiscount = 0
            if (totalDiscount > 0) {
                // Distribute discount proportionally based on item's share of total price
                itemDiscount = Math.round(totalDiscount * (item.itemTotalPrice / total_price))
            }
            
            // Due to rounding, the distributed discount might be slightly off from the total, but we apply it per item quantity
            // price_after_discount is per unit
            let discountPerUnit = itemDiscount / item.quantity
            let price_after_discount = item.price - discountPerUnit
            if (price_after_discount < 0) price_after_discount = 0

            await TransactionRepository.DBCreateOrder({ 
                order_no, 
                price: item.price, 
                price_after_discount: price_after_discount,
                quantity: item.quantity, 
                product_id: item.product_id 
            }, queryRunner)

            // Update product stock after transaction has been created
            await ProductRepository.DBUpdateStockProduct({ product_id: item.product_id, stock: item.product.stock - item.quantity }, queryRunner)
        }

        await TransactionRepository.DBCreateTransaction({order_no, customer_id, payment_type, status: 1, address, notes}, queryRunner)
        
        if (coupon) {
            await CouponRepository.DBCreateCouponUsage({
                coupon_id: coupon.id,
                user_id: customer_id,
                order_no: order_no,
                amount_cut: totalDiscount
            }, queryRunner)
            
            await CouponRepository.DBUpdateCouponQuota(coupon.id, 1, queryRunner)
        }

        await queryRunner.commitTransaction()

        return { order_no, total_price: total_price - totalDiscount, stock }
    } catch (error) {
        await queryRunner.rollbackTransaction()
        throw error
    } finally {
        await queryRunner.release()
    }
}

export async function transactionListDomain({ lastId = 0, limit = 500, search = "", sort = "DESC" }: TransactionDto.TransactionListDomain) {

    const searchProps = {
        no: "t.no",
        status: "t.status",
        payment_type: "t.payment_type",
        created_at: "t.created_at",
        payment_at: "t.payment_at",
        shipping_at: "t.shipping_at",
        arrived_at: "t.arrived_at",
        order_no: "t.order_no"
    }

    let parsedSearch = format(search, searchProps)

    let searchClause = "1=1"
 
    if (parsedSearch != "" && lastId < 1) {
        // Search when search props not empty and not paginate
        searchClause = `${searchClause} AND (${parsedSearch})`
    } else if (parsedSearch != "" && lastId > 0) {
        // Search when search props not empty and wanting to paginate
        searchClause = `${searchClause} AND (${parsedSearch}) AND t.no ${sort == "ASC" ? ">" : "<"} ${lastId}`
    } else if (parsedSearch == "" && lastId > 0) {
        searchClause = `${searchClause} AND t.no ${sort == "ASC" ? ">" : "<"} ${lastId}`
    }

    const transaction = await TransactionRepository.DBTransactionList({ limit, search: searchClause, sort })

    if(transaction.length < 1) {
        return {
            data: [],
            column: [],
            hasNext: -1
        }
    } 


    const result = {
        data: transaction.map(p => Object.values(p)),
        column: Object.keys(transaction[0]),
        hasNext: -1
    }

    if (transaction.length > limit) {
        transaction.length = limit
        result.data.length = limit
        result.hasNext = transaction[transaction.length - 1].no
    }


    return result
}

export async function paymentOrderDomain({amount, order_no, customer_id, email, username}: TransactionDto.PaymentOrderDomainParams) {
    const transaction = await TransactionRepository.DBCheckCustomerTransactionExist({customer_id, order_no})

    // Check if transaction has been paid
    if (transaction.status == 2) {
        throw new RequestError("TRANSACTION_HAS_BEEN_PAID")
    }

    // Check if transaction is pending
    if(transaction.status != 1) {
        throw new RequestError("INVALID_SESSION_PLEASE_CHECK_YOUR_TRANSACTION_STATUS")
    }

    const orders = await TransactionRepository.DBGetOrders(transaction.order_no)

    const total_price = orders.map(order => order.quantity * order.price).reduce((acc, curr) => acc + curr, 0)

    if(total_price != amount) {
        throw new RequestError("INVALID_AMOUNT")
    }

    // Set transaction to pending approval 
    await TransactionRepository.DBUpdateTransactionStatus({order_no, status: 2})

    await mailer.parseAndSendMail({
        props: {
            order_no,
            order_time: moment.unix(transaction.created_at).format(`YYYY-MM-DD HH:mm`),
            total_price: formatNominalIDR(total_price),
            items: orders,
            username
        },
        subject: "Payment Order Confirmation",
        template: "ORDER_CONFIRMATION",
        to: email
    })

    return true
}

export async function getTransactionDetailsDomain({customer_id, order_no}: TransactionDto.GetTransactionDetailsQueryParams) {
    const transaction = await TransactionRepository.DBCheckCustomerTransactionExist({customer_id, order_no})
    const orders = await TransactionRepository.DBGetOrders(order_no)

    return {
        order_no,
        payment_type: transaction.payment_type,
        address: transaction.address,
        notes: transaction.notes,
        created_at: transaction.created_at,
        payment_at: transaction.payment_at,
        shipping_at: transaction.shipping_at,
        arrived_at: transaction.arrived_at,
        status: transaction.status,
        items: orders
    }
}

export async function getOrdersDomain(order_no: string) {
    return await TransactionRepository.DBGetOrders(order_no)
}

export async function confirmOrderDomain({order_no, user_id}: TransactionDto.ConfirmOrderDomain) {
    // Check order exist
    const transaction = await TransactionRepository.DBCheckPendingTransaction(order_no)

    // Check Transaction Status
    if(transaction.status != 2) {
        throw new RequestError("PLEASE_FINISH_PREVIOUS_STEP_FIRST")
    }

    // Update order to packing
    await TransactionRepository.DBUpdateTransactionStatus({order_no, status: 3, verified_by: user_id})

    return true
}

export async function changeDeliveryStatusHandler({order_no, user_id: delivered_by}: TransactionDto.ChangeDeliveryStatusDomain) {
    await TransactionRepository.DBCheckTransactionDelivery(order_no)

    await TransactionRepository.DBUpdateTransactionStatus({ status: 4, delivered_by, order_no  })

    return true
}

export async function setDeliveryDomain({ order_no }: TransactionDto.SetDeliveryOrderDomainParams) {
    const transaction = await TransactionRepository.DBCheckTransactionExist({ order_no })

    if(transaction.status != 3) {
        throw new RequestError("INVALID_SESSION_TRANSACTION")
    }

    await TransactionRepository.DBSetDeliveryOrder(order_no)

    return true
}

export async function setArrivedDomain({ attachment, order_no, delivered_by }: TransactionDto.SetArrivedDomain) {
    await TransactionDto.setArrivedSchema.parseAsync({ attachment, order_no })

    // Check Transaction exists
    await TransactionRepository.DBCheckTransactionArrived({ delivered_by, order_no })

    // Save file attachments
    await CommonRepository.uploadImage({ file: attachment, dir: "/orders", filename: `${order_no.split("/").join("-")}.png` })

    // Update status to arrived
    await TransactionRepository.DBUpdateTransactionStatus({ status: 5, order_no })

    return true
}

export async function finishOrderDomain({ customer_id, order_no }: TransactionDto.finishOrderDomain) {
    // Check transaction exist
    const transaction = await TransactionRepository.DBCheckCustomerTransactionExist({ customer_id, order_no })

    // Check transaction status, if not arrived yet throw error
    if(transaction.status != 5) {
        throw new RequestError("INVALID_TRANSACTION_STATUS")
    }

    // Update transaction status to finish
    await TransactionRepository.DBUpdateTransactionStatus({ status: 6, order_no })

    return true
}

export async function readyDeliveryListDomain() {
    const transaction = await TransactionRepository.DBGetDeliveryReadyList()

    const list = transaction.map(async (data) => {
        const orders = await TransactionRepository.DBGetOrders(data.order_no)
        return {
            ...data,
            orders,
        }
    })

    const result = await Promise.all(list)

    return result
}

export async function onDeliveryListHandler({ delivered_by }: TransactionDto.OnDeliveryListDomain) {
    const transaction = await TransactionRepository.DBGetOnDeliveryList(delivered_by)

    const list = transaction.map(async (data) => {
        const orders = await TransactionRepository.DBGetOrders(data.order_no)
        return {
            ...data,
            orders,
        }
    })

    const result = await Promise.all(list)

    return result
}

export async function customerTransactionListDomain({ lastId = 0, limit = 500, search = "1=1", sort = "DESC", customer_id }: TransactionDto.CustomerTransactionListDomain) {
    const searchProps = {
        no: "t.no",
        status: "t.status",
        payment_type: "t.payment_type",
        created_at: "t.created_at",
        payment_at: "t.payment_at",
        shipping_at: "t.shipping_at",
        arrived_at: "t.arrived_at",
        order_no: "t.order_no"
    }

    let parsedSearch = format(search, searchProps)

    let searchClause = "1=1"

    if (parsedSearch != "" && lastId < 1) {
        // Search when search props not empty and not paginate
        searchClause = `${searchClause} AND (${parsedSearch})`
    } else if (parsedSearch != "" && lastId > 0) {
        // Search when search props not empty and wanting to paginate
        searchClause = `${searchClause} AND (${parsedSearch}) AND t.no ${sort == "ASC" ? ">" : "<"} ${lastId}`
    } else if (parsedSearch == "" && lastId > 0) {
        searchClause = `${searchClause} AND t.no ${sort == "ASC" ? ">" : "<"} ${lastId}`
    }

    const transaction = await TransactionRepository.DBCustomerTransactionList({ search: searchClause, sort, customer_id, limit })

    if (transaction.length < 1) {
        return {
            data: [],
            column: [],
            hasNext: -1
        }
    }


    const result = {
        data: transaction.map(p => Object.values(p)),
        column: Object.keys(transaction[0]),
        hasNext: -1
    }

    if (transaction.length > limit) {
        transaction.length = limit
        result.data.length = limit
        result.hasNext = transaction[transaction.length - 1].no
    }


    return result
}


export async function cancelOrderDomain({ customer_id, order_no }: TransactionDto.CancelOrderDomain) {
    // Check order exist (status must be < 2)
    const transaction = await TransactionRepository.DBCheckCustomerTransactionExist({ order_no, customer_id })


    // Error Handling error
    if((transaction.status == 4 && transaction.shipping_at == null && transaction.delivered_by == null) || transaction.status > 4) {
        throw new RequestError("INVALID_ORDER_STATUS")
    }

    const orders = await TransactionRepository.DBGetOrders(order_no)

    // Update Stock 
    for (const order of orders) {
        const product = await ProductRepository.DBCheckProductExist(order.product_id)
        await ProductRepository.DBUpdateStockProduct({ product_id: order.product_id, stock: product.stock + order.quantity })
    }

    // Change transaction status to 7 (cancel)
    await TransactionRepository.DBUpdateTransactionStatus({ order_no, status: 7 })

    return true
}


export async function confirmedOrderListDomain() {
    // Get Confirmed order (status = 3)
    const transactions = await TransactionRepository.DBConfirmedOrderList()

    const list = transactions.map(async (trans) => {
        const orders = await TransactionRepository.DBGetOrders(trans.order_no)
        return {
            ...trans,
            orders
        }
    })

    return Promise.all(list)
}


export async function transactionDetailsDomain({ order_no }: TransactionDto.TransactionDetailsDomain) {
    // Check Transaction Exist
    const transaction = await TransactionRepository.DBCheckTransactionExist({ order_no })

    // Get Ordered Products
    const orders = await TransactionRepository.DBGetOrders(order_no)

    return {
        order_no: transaction.order_no,
        arrived_at: transaction.arrived_at,
        created_at: transaction.created_at,
        delivered_by: transaction.delivered_by,
        payment_at: transaction.payment_at,
        shipping_at: transaction.shipping_at,
        verified_by: transaction.verified_by,
        payment_type: transaction.payment_type,
        status: transaction.status,
        address: transaction.address, 
        notes: transaction.notes,
        items: orders,
        attachment: CommonRepository.getImageURL({ filename: `${order_no.split('/').join('-')}.png`, pathdir: "orders" })
    }
}


function formatNominalIDR(num: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)
}
