import { FastifyRequest } from "fastify";
import { RequestError } from "src/config/error";
import * as UserDomainService from "src/services/domain/User";
import { AddProductByAdmin } from "src/services/models/Product";
import { CreateUserByAdmin, DeleteUserRequest } from "src/services/models/User";
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

export async function deleteUserByAdminController(request: FastifyRequest){
    try{
        const {email} = request.body as DeleteUserRequest
        const deleteUser = await UserDomainService.deleteUserByAdmin({
            email
        })

        return {message:deleteUser}
    } catch (error){
        throw error
    }
}