import db from "@database"
import { FastifyReply, FastifyRequest } from "fastify";
import { RequestError } from "src/config/error";
import * as ProductDomainService from "src/services/domain/Product";
import * as TransactionDomainService from "src/services/domain/Transaction";
import * as UserDomainService from "src/services/domain/User";
import * as CartDomainService from "src/services/domain/Cart";
import * as UserDto from "src/services/models/User";
import * as TransactionDto from "src/services/models/Transaction";
import * as CartDto from "src/services/models/Cart";
import * as Jwt from "src/utils/jwt";
import * as Bcrypt from "src/utils/password";
import * as ProductDto from "src/services/models/Product"
import { number } from "zod";


export async function getProductHandler() {
    try {
        const product = await ProductDomainService.getProductsDomain();
        return product
    } catch (error) {
        throw error
    }

}

export async function loginHandler(request: FastifyRequest) {
    try {
        const { email, password } = request.body as UserDto.LoginRequest
        const login = await UserDomainService.loginDomain({email, password})

        return { message: login }
    } catch (error) {
        throw error
    }
}

export async function changePassword(request: FastifyRequest) {
    try {
        const { old_password, new_password, password_confirmation } = request.body as UserDto.ChangePassRequest
        const user = request.user
        const changePassword = await UserDomainService.changePasswordDomain({
            old_password, new_password, password_confirmation, user_id: user.id
        })

        return { message: changePassword }
    } catch (error) {
        throw (error)
    }
}

export async function registerHandler(request: FastifyRequest) {
    try {
        const { username, email, password, password_confirmation, phone_number, address, first_name, last_name } = request.body as UserDto.RegisterRequest;

        const register = await UserDomainService.registerDomain({address, username, email, password, password_confirmation, phone_number, first_name, last_name})

        return { message: register }
    } catch (error) {
        throw error
    }

}

export async function createOrderHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id: customer_id } = request.user
    const { order, payment_type } = request.body as TransactionDto.CreateOrderRequest
    try {
        const transaction = await TransactionDomainService.createTransactionDomain({customer_id, order, payment_type})

        reply.code(201).send({ message: transaction })
    } catch (error) {
        throw error  
    }
}

export async function getPaymentTypesHandler() {
    try {
        const payments = await TransactionDomainService.getPaymentTypesDomain()
        return {message: payments}
    } catch (error) {
        throw error
    }
}


export async function TransactionHistoryHandler(request: FastifyRequest, reply: FastifyReply) {
    // const user = request.user;
    const {status} = request.body as TransactionDto.TransactionHistoryRequest;
    // const userid = user.id;

    if(status){
        return await TransactionDomainService.TransactionHistoryDomain({
            userid: 6,
            status
        })
    }else{
        return await TransactionDomainService.TransactionHistoryDomain({
            userid: 6
        })
    }

}

export async function paymentOrderHandler(request: FastifyRequest) {
    try {
        const { id: customer_id } = request.user
        const { amount, order_no } = request.body as TransactionDto.PaymentOrderRequest
        const payment = await TransactionDomainService.paymentOrderDomain({amount, order_no, customer_id})

        return {message: payment}
    } catch (error) {
        throw error
    }
}

export async function addProductToCart(request: FastifyRequest) {
    try {
        const {product_id, quantity} = request.body as CartDto.AddProductToCartRequest
        const user = request.user

        await CartDomainService.AddProductToCartDomain({
            product_id,
            quantity,
            userid: user.id
        })

        return { message: true }
    } catch (error){
        throw (error)
    }}

export async function getOrderDetailsHandler(request: FastifyRequest) {
    try {
        const {id: customer_id} = request.user
        const {order_no} = request.params as TransactionDto.GetOrderDetailsRequest
        const transaction = await TransactionDomainService.getTransactionDetailsDomain({customer_id, order_no})

        return {message: transaction}
    } catch (error) {
        throw error
    }
}

export async function getProductDetailsHandler(request: FastifyRequest){
    try {
        const {id} = request.body as ProductDto.GetProductDetails

        const getProductDetails = await ProductDomainService.getProductDetailsDomain(id)

        return getProductDetails
    } catch (error){
        throw error
    }
}