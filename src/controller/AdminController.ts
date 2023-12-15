import { FastifyRequest } from "fastify";
import { RequestError } from "src/config/error";
import * as UserDomainService from "src/services/domain/User";
import { AddProductByAdmin } from "src/services/models/Product";
import { CreateUserByAdmin } from "src/services/models/User";
import * as Bcrypt from "src/utils/password"

export async function Hello(request: FastifyRequest) {
    return { message: "Hello" }
}

export async function getUsersHandler() {
    const users = await UserDomainService.getUsersDomain()
    return users
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
        
        await UserDomainService.createUserByAdmin({
            username,
            email,
            first_name,
            last_name,
            password,
            user_level,
            password_confirmation,
            user_id_level:request.user.user_level
        })

        return {message:true}

    } catch (error){
        throw error
    }
}