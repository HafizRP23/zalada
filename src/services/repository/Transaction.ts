import db from "@database";
import { OrderHistoryParams, OrderHistoryResult } from "../models/Transaction";

export async function DBOrderHistory(params: OrderHistoryParams) {
  const orderHistory = await db.query<OrderHistoryResult[]>(`SELECT t.status, t.payment_type, t.order_time, o.order_no, o.product_id, o.price, o.quantity FROM transactions t INNER JOIN orders o ON t.order_no = o.order_no WHERE t.customer_id = ? ${params.status ? `AND t.status = ${params.status}`: ''}`, [params.userid]);

  return orderHistory;
}
