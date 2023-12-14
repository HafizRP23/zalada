import * as TransactionRepository from "../repository/Transaction";
import { OrderHistoryParams, OrderHistoryResponse } from "src/services/models/Transaction";


export async function OrderHistoryDomain(params: OrderHistoryParams) {
    const orderHistory = await TransactionRepository.DBOrderHistory(params);

    if(orderHistory.length < 1){
        throw new Error("NO_TRANSACTIONS_FOUND")
    }

    const result: OrderHistoryResponse = {}

    for(const item of orderHistory){
       
        if(!result[item.order_no]){
            result[item.order_no] = {
                order_no: item.order_no,
                product: [],
                status: item.status,
                payment_type: item.payment_type,
                order_time: item.order_time,
                total_price: 0
            }
        }
        
        result[item.order_no].product.push({
            product_id: item.product_id,
            price: item.price,
            quantity: item.quantity
        })

        result[item.order_no].total_price += item.price * item.quantity
    }

    return result;
}