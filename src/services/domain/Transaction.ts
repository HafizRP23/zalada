import * as TransactionRepository from "../repository/Transaction";

export async function CustomerOrderHistoryByDeliveryStatusDomain(status: string) {
    const orderHistory = await TransactionRepository.DBCustomerOrderHistoryByDeliveryStatus(status);

    return orderHistory.length > 0 ? orderHistory : [];
}