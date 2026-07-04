import { FastifyReply, FastifyRequest } from "fastify";
import { RequestError } from "src/services/models/Common"
import * as CouponDomainService from "src/services/domain/Coupon";;
import * as ProductDomainService from "src/services/domain/Product";
import * as TransactionDomainService from "src/services/domain/Transaction";
import * as UserDomainService from "src/services/domain/User";
import * as CartDomainService from "src/services/domain/Cart";
import * as UserDto from "src/services/models/User";
import * as TransactionDto from "src/services/models/Transaction";
import * as ProductDto from "src/services/models/Product"
import * as CartDto from "src/services/models/Cart";
import { QueryFailedError } from "typeorm";


export async function getProductHandler(request: FastifyRequest) {
    try {
        const {lastId, limit, sort, search, filter } = request.body as ProductDto.GetProductListRequest
        const product = await ProductDomainService.getProductsDomain({limit,search, sort, lastId, filter});
        return {
            message: product
        }
    } catch (error) {
        // Error Handling when query error on search
        if(error instanceof QueryFailedError) {
            throw new RequestError("INVALID_SEARCH_PROPERTIES")
        }
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
    const { order, payment_type, address, notes } = request.body as TransactionDto.CreateOrderRequest
    try {
        const transaction = await TransactionDomainService.createTransactionDomain({customer_id, order, payment_type, address, notes})

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

export async function paymentOrderHandler(request: FastifyRequest) {
    try {
        const { id: customer_id, email, username } = request.user
        const { amount, order_no } = request.body as TransactionDto.PaymentOrderRequest
        const payment = await TransactionDomainService.paymentOrderDomain({amount, order_no, customer_id, email, username})

        return {message: payment}
    } catch (error) {
        throw error
    }
}

export async function addProductToCartHandler(request: FastifyRequest) {
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

export async function getProductDetailsHandler(request: FastifyRequest) {
    try {
        const { id } = request.params as ProductDto.GetProductDetails

        const getProductDetails = await ProductDomainService.getProductDetailsDomain(id)

        return getProductDetails
    } catch (error) {
        throw error
    }
}

export async function deleteProductFromCartHandler(request: FastifyRequest) {
    try {
        const {product_id, quantity} = request.body as CartDto.DeleteProductFromCartRequest
        const user = request.user

        await CartDomainService.DeleteProductFromCartDomain({
            quantity,
            product_id,
            userid: user.id
        })

        return { message: true }
    } catch (error){
        throw error
    }}

export async function finishOrderHandler(request: FastifyRequest) {
    try {
        const { id: customer_id } = request.user
        const { order_no } = request.body as TransactionDto.FinishOrderRequest

        const response = await TransactionDomainService.finishOrderDomain({ customer_id, order_no })

        return { message: response }
    } catch (error) {
        throw error
    }
}

export async function addProductReview(request:FastifyRequest){

    try {
        const {id: customer_id} = request.user
        const {product_id,order_no,message,rating} = request.body as ProductDto.ReviewProductRequest

        const review_product = await ProductDomainService.addReviewProduct({
            customer_id,product_id,order_no,message,rating
        })

        return {message:review_product}
    } catch (error) {
        throw error
    }
}

export async function orderListHandler(request: FastifyRequest) {
    try {
        const { id: customer_id } = request.user
        const { lastId, limit, search, sort } = request.body as TransactionDto.OrderListRequest

        const orders = await TransactionDomainService.customerTransactionListDomain({ customer_id, lastId, limit, search, sort })

        return { message: orders }
    } catch (error) {
        if (error instanceof QueryFailedError) {
            throw new RequestError("INVALID_SEARCH_PROPERTIES")
        }
        throw error
    }
}

export async function cancelOrderHandler(request: FastifyRequest) {
    try {
        const { id: customer_id } = request.user
        const { order_no } = request.body as TransactionDto.CancelOrderRequest

        const orders = await TransactionDomainService.cancelOrderDomain({ customer_id, order_no })

        return { message: orders }
    } catch (error) {
        throw error
    }
}

export async function listActiveCouponsHandler(request: FastifyRequest) {
    try {
        const response = await CouponDomainService.listActiveCouponsDomain()
        return { message: response }
    } catch (error) {
        throw error
    }
}