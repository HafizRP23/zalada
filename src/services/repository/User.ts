import DatabaseService from "@infrastructure/database"
import * as UserTypes from "../models/User/type"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"
import { NotFoundError, RequestError, ServerError } from "src/config/error";


const db = DatabaseService.getDatasource()

export async function DBGetUsers() {
  const query = await db.query<UserTypes.GetUserResponse[]>("SELECT id, username, email, phone_number, address, registered_date FROM users")
  return query
}

export async function DBCheckUserExist(user_id: number): Promise<UserTypes.User[]> {
  const query = await db.query<UserTypes.User[]>("SELECT * FROM users WHERE id = ?", [user_id])
  return query
}

export async function DBGetStaffs() {
    const query = await db.query<UserTypes.GetUserResponse[]>(
      "SELECT id, username, email, phone_number, address, registered_date FROM users WHERE user_level = 2"
    )

    return query
}


export async function DBCheckUserExistByEmail(email: string) {
  const query = await db.query<UserTypes.User[]>("SELECT * FROM users WHERE email = ?", [email])
  if (query.length >= 1) {
    throw new RequestError("EMAIL_ALREADY_EXIST")
  }
  return query
}

export async function DBGetUserRules(user_id: number) {
  const query = await db.query<Array<{ rules_id: number, rules_name: string }>>(`SELECT ugr.rules_id rules_id, uru.name rules_name FROM users u LEFT JOIN user_roles ur ON ur.id = u.user_level INNER JOIN user_group_rules ugr ON ugr.role_id = ur.id LEFT JOIN user_rules uru ON uru.id = ugr.rules_id WHERE u.id = ?`, [user_id])
  return query
}

export async function DBCreateUserByAdmin(params:UserTypes.CreateUserQueryParams){
  const {username,email,first_name,last_name,password,user_level} = params
  const query = await db.query<ResultSetHeader>(
    "INSERT INTO users( username,email,first_name,last_name,password,user_level ) VALUES (?,?,?,?,?,?)",[username,email,first_name,last_name,password,user_level]
  )
}

export async function DBRegister({ address, email, password, phone_number, username, first_name, last_name }: UserTypes.RegisterQueryParams) {
  const [customerRole] = await db.query<Array<{ id: number, name: string }>>("SELECT * FROM user_roles WHERE name = ?", ['customer'])
  const params = [
    [username, email, password, first_name, last_name, phone_number, address, customerRole.id]
  ]
  const query = await db.query<ResultSetHeader>("INSERT INTO users (username, email, password, first_name, last_name, phone_number, address, user_level) VALUES ?", [params])
  return query
}

export async function changePassword(params:UserTypes.ChangePassQueryParams,queryRunner:QueryRunner){
  const {user_id,new_password} = params
  const query = await db.query<ResultSetHeader>(
    "UPDATE users SET password = ? WHERE id = ? ",[new_password, user_id, queryRunner]
  )
  return query
}

export async function DBCheckUserLevel(id:number){
  const query = await db.query<UserTypes.CheckRoles[]>(
    "SELECT id FROM user_roles WHERE id = ?",[id]
  )

  if(query.length < 1) {
    throw new NotFoundError("USER_LEVEL_NOT_EXIST")
  }
  return query
}