import db from "@database";
import { User } from "@entities";
import { FastifyReply, FastifyRequest } from "fastify";
import * as ProductDomainService from "src/services/domain/Product";
import * as ProductModel from "src/services/models/Product"

export async function getProducstHandler(request: FastifyRequest, reply: FastifyReply) {
    const product = await ProductDomainService.getProducts();
    reply.send(product);
}

// export async function orderProductHandler(request: FastifyRequest, reply: FastifyReply) {
//     const orderProduct = await ProductDomainService.orderProduct();
//     reply.send(orderProduct)
// }


export async function orderProductHandler(request: FastifyRequest) {
    try{
        const {name, quantity} = request.body as ProductModel.orderProductRequest 
        const orderProduct = await ProductDomainService.orderProduct();
        return orderProduct
    } catch (error) {
        throw error
    }
}