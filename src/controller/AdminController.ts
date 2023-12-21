import { FastifyRequest } from "fastify";
import { RequestError } from "src/config/error";
import * as UserDomainService from "src/services/domain/User";
import { AddProductByAdmin } from "src/services/models/Product";
import { CreateRulesRequest, CreateUserByAdmin, GetUserListRequest, RestoreTrashedUser } from "src/services/models/User";
import * as Bcrypt from "src/utils/password"
import { QueryFailedError } from "typeorm";

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
        const { role_id, rules } = request.body as CreateRulesRequest

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