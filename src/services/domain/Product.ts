import * as ProductRepository from "../repository/Product";

export async function getProducts() {
    return await ProductRepository.DBGetProducts()
}

export async function orderProduct() {
    return await ProductRepository.DBOrderProduct()
}