import db from "@database";
import { CustomerOrderHistoryByDeliveryStatusResponse } from "../models/Transaction";

export async function DBCustomerOrderHistoryByDeliveryStatus(status: string) {
  const orderHistory = await db.query<CustomerOrderHistoryByDeliveryStatusResponse[]>("SELECT order_no, product_id, quantity, order_time, status, customer_id, payment_type FROM transacions WHERE customer_id = ? AND status = ?", [status]);
  return orderHistory;
}
