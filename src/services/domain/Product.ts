import * as ProductRepository from "../repository/Product";

export async function getProducts() {
    return await ProductRepository.DBGetProducts()
}

export async function orderHistoryByDeliveryStatusHandler() {
    return await ProductRepository.DBGetProducts()
}