import { FastifyInstance, RouteOptions } from "fastify";
import * as AdminController from "../controller/AdminController";
import { userSchema } from "../services/models/User";
import * as Auth from "src/config/auth";
import { productSchema } from "src/services/models/Product";
import { ListRules } from "src/config/rules";

const routes: RouteOptions[] = [
    {
        method: ["GET"],
        url: "/test",
        schema: {
            tags: ["Admin Services"],
            security: [
                {
                    authorization: []
                }
            ],
            response: {
                200: userSchema("helloSchema")
            }
        },
        handler: AdminController.Hello
    },
    {
        method: ["GET"],
        url: "/users",
        schema: {
            tags: ["Admin Services"],
            security: [
                {
                    authorization: []
                }
            ]
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_VIEW_USER),
        handler: AdminController.getUsersHandler
    },
    {
        method: ["POST"],
        url: "/add-products",
        schema: {
            tags: ["Admin Services"],
            security:[
                {
                    authorization: []
                }
            ],
            body: productSchema("addProductsSchema"),
            response:{
                200: productSchema("addProductsResponse")
            }
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_PRODUCT),
        handler: AdminController.addProductsHandler
    },
    {
        method: ["POST"],
        url: "/add-users",
        schema: {
            tags: ["Admin Services"],
            security:[
                {
                    authorization: []
                }
            ],
            body: userSchema("createUsers"),
            response: {
                200: userSchema("createUsersResponse")
              }
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_USER),
        handler: AdminController.createUserByAdmin
    },
    {
        method: ["POST"],
        url: "/delete-user",
        schema:{
            tags:["Admin Services"],
            security:[
                {
                    authorization:[]
                }
            ],
            body: userSchema("deleteUserRequest"),
            response: {
                200:userSchema("deleteUserResponse")
            }
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_DELETE_USER),
        handler: AdminController.deleteUserByAdminController
    }
]

export default async function AdminRoutes(server: FastifyInstance) {
    server.addHook("preHandler", Auth.CheckAuth)
    for (const route of routes) {
        server.route({ ...route })
    }
}