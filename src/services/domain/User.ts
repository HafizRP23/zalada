import { NotFoundError, RequestError, ServerError } from "src/config/error";
import * as UserRepository from "../repository/User";
import * as UserTypes from "../models/User/type"
import * as ProductDto from "../models/Product";
import * as ProductRepository from "../repository/Product";
import database from "@infrastructure/database";
import * as Bcrypt from "src/utils/password";
import { AddTrashTableAndChangeRelationalContrainst1702102395166 } from "ormconfig/migrations/1702102395166-add-trash-table-and-change-relational-contrainst";

export async function getUsersDomain() {
  return await UserRepository.DBGetUsers()
}

export async function checkUserExistDomain(user_id: number) {
  const user = await UserRepository.DBCheckUserExist(user_id)

  if(user.length < 1) {
    throw new NotFoundError("USER_NOT_FOUND")
  }

  return user[0]
}

export async function addProductByAdmin(params:ProductDto.AddProductByAdmin) {
  const addProductByAdmin = await ProductRepository.DBAddProductByAdmin(params)
  return addProductByAdmin
}

export async function getStaffsDomain() {
    return await UserRepository.DBGetStaffs()
}

export async function checkUserExistByEmailDomain(email: string) {
  const user = await UserRepository.DBCheckUserExistByEmail(email)

  if (user.length < 1) {
    throw new NotFoundError("USER_NOT_FOUND")
  }

  return user[0]
}


export async function createUserByAdmin(params:UserTypes.CreateUserByAdmin){
  const createUserByAdmin = await UserRepository.DBCreateUserByAdmin(params)

  return createUserByAdmin
}

export async function checkEmailExistDomain(email:string){
  const emailExist = await UserRepository.DBCheckUserExistByEmail(email)

  return emailExist[0]
}

export async function registerDomain(user: UserTypes.RegisterQueryParams) {
  const result = await UserRepository.DBRegister(user);

  if (result.affectedRows < 1) {
    throw new NotFoundError("FAILED_REGISTER")
  }

  return result
}

export async function changePasswordDomain(params: UserTypes.ChangePassRequest) {
  const { new_password, old_password, password_confirmation, user_id } = params

  if (params.new_password != params.password_confirmation) {
    throw new RequestError("CONFIRMATION_PASSWORD_DOES_NOT_MATCH");
  }

  const data_user = await UserRepository.DBCheckUserExist(user_id)

  const checkPass = await Bcrypt.checkPassword({ hash: data_user[0].password, password: old_password })
  if (!checkPass) {
    throw new RequestError("INVALID_PASSWORD")
  }

  const db = database.getDatasource()
  const conn = db.createQueryRunner()
  await conn.connect()
  try {
    await conn.startTransaction()

    const hashPassword = await Bcrypt.hashPassword(new_password)

    const result = await UserRepository.changePassword({ new_password: hashPassword, user_id }, conn)

    await conn.commitTransaction();
    await conn.release();

    return result;

  } catch (error) {
    await conn.rollbackTransaction();
    await conn.release();
    throw error
  }
}

export async function restoreTrashedUser(params:UserTypes.RestoreTrashedUser){
  const {username,email} = params

  const trashedUser = await UserRepository.DBGetTrashedUser({username,email})

  const deleted_user_data = trashedUser[0]

  const db = database.getDatasource()
  const conn = db.createQueryRunner()
  await conn.connect()
  try{
    await conn.startTransaction()
    
    const restore_user = await UserRepository.DBRestoreTrashedUser(deleted_user_data,conn)
    if (restore_user.affectedRows < 1) {
      throw new ServerError("FAILED_RESTORE_USER")
    }

    const delete_trashed_user = await UserRepository.DBDeleteTrashedUser(deleted_user_data.username, conn)
    if (delete_trashed_user.affectedRows < 1) {
      throw new ServerError("FAILED_TO_DELETE_TRASHED_USER")
    }

    await conn.commitTransaction();
    await conn.release();

    return true
  } catch (error) {
    await conn.rollbackTransaction();
    await conn.release();
    throw error
  }
}
