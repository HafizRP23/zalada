import { FastifyReply, FastifyRequest } from "fastify";
import * as TransactionDomainService from "src/services/domain/Transaction";
import * as ProductDomainService from "src/services/domain/Product";
import { CustomerOrderHistoryByDeliveryStatusRequest } from "src/services/models/Transaction";
import * as z from "zod";

export async function getProducstHandler(request: FastifyRequest, reply: FastifyReply) {
    const product = await ProductDomainService.getProducts();
    reply.send(product);
}

export async function CustomerOrderHistoryByDeliveryStatusHandler(request: FastifyRequest, reply: FastifyReply) {
    const {status} = request.body as CustomerOrderHistoryByDeliveryStatusRequest;
    // todo: tambahkan userid 

    const orderHistory = await TransactionDomainService.CustomerOrderHistoryByDeliveryStatusDomain(status);

    reply.send(status);
}