import * as z from 'zod'
import { changePassRequest, deleteUserRequest, loginRequest, registerRequest } from './schema'

export type User = {
    id: number
    username: string
    email: string
    password: string
    phone_number: string
    address: string
    registered_date: Date
    user_level: number
    first_name: string
    last_name: string
}

export type RegisterQueryParams = {
    username: string
    email: string
    password: string
    phone_number: string
    address: string
    first_name: string
    last_name: string
}

export type LoginRequest = z.infer<typeof loginRequest>

export type RegisterRequest = z.infer<typeof registerRequest>

export type GetUserResponse = Omit<User, 'password' | "user_level">

export type CheckUserByUsernameOrEmailParams = {
    username: string
    email: string
}


export type CreateUserByAdmin = {
    username:string;
    email:string;
    first_name:string,
    last_name:string,
    password:string;
    password_confirmation:string;
    user_level:number;
}

export type ChangePassRequest = z.infer<typeof changePassRequest> & {user_id:number}

export type ChangePassQueryParams ={
    new_password:string;
    user_id:number;
}

export type DeleteUserQueryParams = {
    id: number
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number: string
    address: string
    registered_date: Date
    user_level: number
}

export type DeleteUserRequest = z.infer<typeof deleteUserRequest>