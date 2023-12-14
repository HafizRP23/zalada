import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";

const helloSchema = z.object({
  message: z.string(),
});

export const loginRequest = z.object({
  email: z.string().email(),
  password: z.string()
})

export const registerRequest = z.object({
  username: z.string().min(2).max(50).regex(/^[a-zA-Z ]+$/),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  password: z.string().min(6).max(12),
  password_confirmation: z.string().min(6).max(12),
  phone_number: z.string().min(10).max(15).regex(/^[0-9]+$/),
  address: z.string()
})

export const registerResponse = z.object({
  message: z.boolean()
})

export const createUsers = z.object({
  email: z.string().email(),
  first_name:z.string(),
  last_name:z.string(),
  username: z.string(),
  password:z.string().min(6).max(12),
  password_confirmation: z.string().min(6).max(12),
  user_level: z.number()
})
export const createUsersResponse = z.object({
  message: z.boolean()
})

export const changePassRequest = z.object({
  old_password:z.string(),
  new_password: z.string().min(6).max(12),
  password_confirmation: z.string().min(6).max(12),
})

export const changePassResponse = z.object({
  message: z.boolean()
})

export const deleteUserRequest = z.object({
  email:z.string()
})

export const deleteUserResponse = z.object({
  message:z.boolean()
})

export const { schemas: userSchemas, $ref: userSchema } = buildJsonSchemas(
  {
    helloSchema,
    loginRequest,
    registerRequest,
    registerResponse,
    createUsers,
    createUsersResponse,
    changePassRequest,
    changePassResponse,
    deleteUserRequest,
    deleteUserResponse,
  },
  {
    $id: "userSchema",
  }
);
