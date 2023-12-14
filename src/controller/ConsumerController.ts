import db from "@database";
import { User } from "@entities";
import { FastifyReply, FastifyRequest } from "fastify";
import * as TransactionDomainService from "src/services/domain/Transaction";
import * as ProductDomainService from "src/services/domain/Product";
import { OrderHistoryRequest } from "src/services/models/Transaction";
import * as z from "zod";

export async function getProducstHandler(request: FastifyRequest, reply: FastifyReply) {
    const product = await ProductDomainService.getProducts();
    reply.send(product);
}

export async function OrderHistoryHandler(request: FastifyRequest, reply: FastifyReply) {
    const {status} = request.body as OrderHistoryRequest;
    const userid = 6; // hapus aja ini buat test doang uncomment yg bawah
    // const user = request.user;
    // const userid = user.id;

    if(status){
        return await TransactionDomainService.OrderHistoryDomain({
            userid,
            status
        })
    }else{
        return await TransactionDomainService.OrderHistoryDomain({
            userid
        })
    }

}