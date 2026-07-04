import { FastifyRequest } from "fastify";
import { RequestError } from "src/services/models/Common";
import * as UserDomainService from "src/services/domain/User";
import * as ProductDomainService from "src/services/domain/Product";
import * as LogDomainService from "src/services/domain/Log";
import { AddProductByAdmin, DeleteProductRequest } from "src/services/models/Product";
import { CreateRulesRequest, CreateUserByAdmin, GetUserListRequest, RestoreTrashedUser, DeleteUserRequest, AddGroupRulesRequest, RevokeGroupRulesRequest } from "src/services/models/User";
import * as Bcrypt from "src/utils/password"
import { QueryFailedError } from "typeorm";
import { ActivityLogListRequest } from "src/services/models/Log";
import * as CouponDomainService from "src/services/domain/Coupon";

export async function Hello(request: FastifyRequest) {
    return { message: "Hello" }
}

export async function getUserListHandler(request: FastifyRequest) {
    try {
        const { lastId, limit, search, sort } = request.body as GetUserListRequest
        const users = await UserDomainService.getUserListDomain({ lastId, limit, search, sort })

        return {
            message: users
        }        
    } catch (error) {
        if(error instanceof QueryFailedError) {
            throw new RequestError("INVALID_SEARCH_PROPERTIES")
        }
        throw error
    }

}

export async function addProductsHandler(request: FastifyRequest) {
    const {name,stock,description,price} = request.body as AddProductByAdmin
    const addProducts = await UserDomainService.addProductByAdmin({
        name, stock, description, price,
    })

    return {message:true}
}

export async function createUserByAdmin(request: FastifyRequest) {
    try{
        const {username,email,first_name,last_name,password,password_confirmation,user_level} = request.body as CreateUserByAdmin
        if (password != password_confirmation) {
            throw new RequestError("CONFIRMATION_PASSWORD_DOES_NOT_MATCH")
        }

        const checkEmail = await UserDomainService.checkEmailExistDomain(email);
        if (checkEmail) {
            throw new RequestError("EMAIL_ALREADY_EXIST")
        } 

        const hashPassword = await Bcrypt.hashPassword(password)

        await UserDomainService.createUserByAdmin({
            username,
            email,
            first_name,
            last_name,
            password: hashPassword,
            user_level,
            password_confirmation
        })

        return {message:true}

    } catch (error){
        throw error
    }
}

export async function getRolesList() {
    try {
        const response = await UserDomainService.getRolesListDomain()
        return { message: response }
    } catch (error) {
        throw error
    }
} 

export async function getRulesList() {
    try {
        const response = await UserDomainService.getRulesListDomain()
        return { message: response }
    } catch (error) {
        throw error
    }
}

export async function addGroupRulesHandler(request: FastifyRequest) {
    try {
        const { role_id, rules } = request.body as AddGroupRulesRequest

        const response = await UserDomainService.addGroupRulesDomain({ role_id, rules })

        return { message: response }   
    } catch (error) {
        throw error
    }
}


export async function restoreTrashedUserController(request: FastifyRequest) {
    try {
        const { id } = request.body as RestoreTrashedUser
        const restoreUser = await UserDomainService.restoreTrashedUser({
            id
        })

        return { message: restoreUser }
    } catch (error) {
        throw error
    }
}


export async function deleteProductController(request:FastifyRequest){
    try{
        const {product_id} = request.body as DeleteProductRequest
        const delete_product = await ProductDomainService.deleteProductByAdmin({
            product_id
        })

        return {message:delete_product}
    } catch (error){
        throw error
    }
}

export async function deleteUserByAdminController(request: FastifyRequest){
    try{
        const { user_id } = request.body as DeleteUserRequest
        const deleteUser = await UserDomainService.deleteUserByAdmin({
            user_id
        })

        return {message:deleteUser}
    } catch (error){
        throw error
    }
}

export async function createRulesHandler(request: FastifyRequest) {
    try {
        const { rules_id, rules_name } = request.body as CreateRulesRequest
        const rules = await UserDomainService.createRulesDomain({ 
            rules_id,
            rules_name
         })

         return {
            message: rules
         }
    } catch (error) {
        throw error
    }
}



export async function revokeGroupRulesHandler(request: FastifyRequest) {
    try {
        const { role_id, rules_id } = request.body as RevokeGroupRulesRequest
        const response = await UserDomainService.revokeGroupRulesDomain({
            role_id,
            rules_id
        })

        return { message: response }
    } catch (error) {
        throw error
    }
}

export async function activityLogListHandler(request: FastifyRequest) {
    try {
        const { lastId, limit, search, sort } = request.body as ActivityLogListRequest
        const response = await LogDomainService.activityLogListDomain({ search, sort, limit, lastId })

        return { message: response }
    } catch (error) {
        if(error instanceof QueryFailedError) {
            throw new RequestError("INVALID_SEARCH_PROPERTIES")
        }
        throw error
    }
}

export async function createCouponHandler(request: FastifyRequest) {
    try {
        const payload = request.body as any
        const response = await CouponDomainService.createCouponDomain(payload)
        return { message: response }
    } catch (error) {
        throw error
    }
}

export async function listCouponsHandler(request: FastifyRequest) {
    try {
        const response = await CouponDomainService.listCouponsDomain()
        return { message: response }
    } catch (error) {
        throw error
    }
}

export async function updateCouponHandler(request: FastifyRequest) {
    try {
        const payload = request.body as any
        const response = await CouponDomainService.updateCouponDomain(payload)
        return { message: response }
    } catch (error) {
        throw error
    }
}