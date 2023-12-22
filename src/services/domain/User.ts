import { NotFoundError, RequestError, ServerError } from "src/config/error";
import * as UserRepository from "../repository/User";
import * as UserTypes from "../models/User"
import * as ProductDto from "../models/Product";
import * as ProductRepository from "../repository/Product";
import database from "@infrastructure/database";
import * as Bcrypt from "src/utils/password";
import * as Jwt from "src/utils/jwt";


export async function getUsersDomain() {
  return await UserRepository.DBGetUsers()
}

export async function checkUserExistDomain(user_id: number) {
  return await UserRepository.DBCheckUserExist(user_id)
}

export async function addProductByAdmin(params:ProductDto.AddProductByAdmin) {
  const addProductByAdmin = await ProductRepository.DBAddProductByAdmin(params)
  return addProductByAdmin
}

export async function getStaffsDomain() {
    return await UserRepository.DBGetStaffs()
}



export async function createUserByAdmin(params:UserTypes.CreateUserByAdmin){
  const createUserByAdmin = await UserRepository.DBCreateUserByAdmin(params)

  return createUserByAdmin
}

export async function checkEmailExistDomain(email: string){
  return await UserRepository.DBCheckUserExistByEmail(email)
}

export async function registerDomain({address, email, first_name, last_name, password, phone_number, username, password_confirmation}: UserTypes.RegisterDomain) {
  if(password !== password_confirmation) {
    throw new RequestError("CONFIRMATION_PASSWORD_DOES_NOT_MATCH")
  }

  await UserRepository.DBCheckUserExistByEmail(email)

  const hashPassword = await Bcrypt.hashPassword(password)
  
  await UserRepository.DBRegister({
    address,
    email,
    first_name,
    last_name,
    password: hashPassword,
    phone_number,
    username
  })


  return true
}

export async function changePasswordDomain(params: UserTypes.ChangePassRequest) {
  const { new_password, old_password, password_confirmation, user_id } = params

  if (params.new_password != params.password_confirmation) {
    throw new RequestError("CONFIRMATION_PASSWORD_DOES_NOT_MATCH");
  }

  const data_user = await UserRepository.DBCheckUserExist(user_id)

  const checkPass = await Bcrypt.checkPassword({ hash: data_user.password, password: old_password })
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

export async function deleteUserByAdmin({email}:UserTypes.DeleteUserRequest){

  const data_user = await UserRepository.DBCheckUserExistByEmail(email) 
  
  const db = database.getDatasource()
  const conn = db.createQueryRunner()
  await conn.connect()
  try {
    await conn.startTransaction()


    const insertToTrashedUser = await UserRepository.DBInsertToTrashedUser( data_user, conn)
    if(insertToTrashedUser.affectedRows < 1){
      throw new ServerError("FAILED_INSERT_TO_TRASH")
    }

    const deleteUser = await UserRepository.DBDeleteUser(data_user.id, conn)
    if (deleteUser.affectedRows < 1) {
      throw new ServerError("FAILED_DELETE_USER");
    }

    await conn.commitTransaction();
    await conn.release();

    return deleteUser;

  } catch (error) {
    await conn.rollbackTransaction();
    await conn.release();
    throw error
  }
}

export async function getRolesListDomain() {
  const roles = await UserRepository.DBGetRoles()
  return roles
}

export async function getRulesListDomain() {
  const rules = await UserRepository.DBGetRules()
  return rules
}

export async function addGroupRulesDomain({ role_id, rules }: UserTypes.CreateRulesDomainParams) {
  const groupRules = await UserRepository.DBGetGroupRules(role_id)

  // Check Roles
  await UserRepository.DBCheckUserLevel(role_id)

  // If admin add more than 1 rule at once
  if (Array.isArray(rules)) {
    for (const rule of rules) {
      const isExist = groupRules.find(gr => gr.rules_id = rule)

      await UserRepository.DBCheckRulesExist(rule)

      if (isExist) {
        throw new RequestError(`${isExist.rules_name}_WAS_ALREADY_EXIST`)
      }

      await UserRepository.DBAddGroupRules({ role_id, rules_id: rule })
    }
  } else {
    const isExist = groupRules.find(rule => rule.rules_id = rules)

    await UserRepository.DBCheckRulesExist(rules)

    if (isExist) {
      throw new RequestError(`${isExist.rules_name}_WAS_ALREADY_EXIST`)
    }

    await UserRepository.DBAddGroupRules({ role_id, rules_id: rules })
  }

  return true
}

export async function loginDomain({ email, password }: UserTypes.LoginDomain) {
  const user = await UserRepository.DBCheckUserExistByEmail(email)

  const isPassword = await Bcrypt.checkPassword({hash: user.password, password})

  if(!isPassword) {
    throw new RequestError("INVALID_PASSWORD")
  }

  const token = await Jwt.signToken({ user_id: user.id, user_level: user.user_level })

  return token
}

export async function editUserDomain(params:UserTypes.EditUserDomain){
  const {id,user_level,username,email,first_name,last_name,phone_number,address} = params
  let user_id = params.id

  await UserRepository.DBCheckUserExist(user_id)

  // Check user level, if not exist will throw an error
  await UserRepository.DBCheckUserLevel(user_level)

  const editUser = await UserRepository.DBEditUserByAdmin({
    id,user_level,username,email,first_name,last_name,phone_number,address
  })

  return editUser
}

export async function restoreTrashedUser(params: UserTypes.RestoreTrashedUser) {
  const { id } = params

  const trashedUser = await UserRepository.DBGetTrashedUser({ id })

  const deleted_user_data = trashedUser[0]

  const db = database.getDatasource()
  const conn = db.createQueryRunner()
  await conn.connect()
  try {
    await conn.startTransaction()

    const restore_user = await UserRepository.DBRestoreTrashedUser(deleted_user_data, conn)
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