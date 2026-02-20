import db from "@database"
import { CronJob } from "cron/dist"
import moment from "moment"
import InfraMail from "@infrastructure/Common/mailer"
import logger from "src/utils/logger"

// Cron for cancel order when customer not pay order for 2 hours
export async function CronOrderAutoCancel() {
    const job = CronJob.from({
        cronTime: `*/1 * * * *`,
        onTick: async () => {
            try {
                // Check transactions that pending transaction for more than 2 hours
                const transactions = await db.query<Array<{ order_no: string, created_at: number }>>(`SELECT order_no, created_at FROM transactions WHERE status = 1 AND ${moment().unix()} - created_at > ${process.env.PENDING_ORDER_MAX_TIME}`)

                for (const trans of transactions) {
                    const orders = await db.query<Array<{ product_id: number, quantity: number }>>(`SELECT product_id, quantity FROM orders WHERE order_no = ?`, [trans.order_no])
                    for (const order of orders) {
                        const [product] = await db.query(`SELECT stock FROM products WHERE id = ?`, [order.product_id])

                        // Set the product stock back to previous order
                        await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [product.stock + order.quantity, order.product_id])
                    }

                    // Set order to cancelled
                    await db.query(`UPDATE transactions SET status = ? WHERE order_no = ?`, [7, trans.order_no])
                    logger.info({ message: "CRON_ORDER_AUTO_CANCEL", data: transactions.length })
                }

            } catch (error) {
                throw error
            }      
        },
        start: false,
        context: "ORDER_AUTOCANCEL"
    })

    try {
        job.start()
        return job
    } catch (error) {
        throw error
    }
}

export async function CronSendNotificationLowStock() {
    const job = CronJob.from({
        cronTime: "0 21 * * *",
        onTick: async () => {
            try {
                const products = await db.query('SELECT * FROM products WHERE stock < ?', [process.env.LOW_STOCK_TRESHOLD])
                if (products.length) {
                    const users = await db.query<Array<{ email: string }>>('SELECT email FROM users WHERE user_level = 1')
                    for (const user of users) {
                        await InfraMail.parseAndSendMail({ to: user.email, subject: "Low Stock Notification", template: "UPDATE_STOCK", props: products })
                    }

                    logger.info({ message: "CRON_SEND_NOTIFICATION", data: products.length })
                }
            } catch (error) {
                throw error
            }
        }
    })

    try {
        job.start()
        return job
    } catch (error) {
        throw error
    }
}

export async function CronAutoFinishTransaction() {
    const job = CronJob.from({
        cronTime: "* 0 * * *",
        onTick: async () => {
            const products = await db.query<Array<{ order_no: string }>>('SELECT order_no FROM transactions WHERE status = 5 AND arrived_at IS NOT NULL')
            
            if(products.length) {
                const productIds = products.map(p => p.order_no).join(',')
                await db.query('UPDATE SET status = 6 WHERE order_no IN ?', [productIds])

                logger.info({ message: "CRON_AUTO_FINISH_TRANSACTION", data: products.length })
            }
        }
    })

    try {
        job.start()
        return job
    } catch (error) {
        throw error
    }
}