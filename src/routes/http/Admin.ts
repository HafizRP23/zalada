import { FastifyInstance, RouteOptions } from "fastify";
import * as AdminController from "../../controller/http/AdminController";
import { userSchema } from "../../services/models/User";
import * as Auth from "src/config/auth";
import { baseSchema, productSchema } from "src/services/models/Product";
import { ListRules } from "src/config/rules";
import { baseResponse, commonSchema } from "src/services/models/Common";
import { request } from "http";
import * as Log from "src/config/log";
import { logSchema } from "src/services/models/Log";
import { couponSchema } from "src/services/models/Coupon";

const routes: RouteOptions[] = [
    {
        method: ["GET"],
        url: "/admin/test",
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
        method: ["POST"],
        url: "/users/list",
        schema: {
            tags: ["Admin Services"],
            summary: "Admin Get User List",
            security: [
                {
                    authorization: []
                }
            ],
            body: userSchema("getUserListRequest"),
            response: baseResponse({ schema: commonSchema("paginationResponse") })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_VIEW_USER),
        handler: AdminController.getUserListHandler
    },
    {
        method: ["POST"],
        url: "/products",
        schema: {
            tags: ["Admin Services"],
            summary: "Admin Create New Products",
            security:[
                {
                    authorization: []
                }
            ],
            body: productSchema("addProductsSchema"),
            response: baseResponse({
                schema: productSchema("addProductsResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_PRODUCT),
        handler: AdminController.addProductsHandler
    },
    {
        method: ["POST"],
        url: "/users",
        schema: {
                tags: ["Admin Services"],
                summary: "Admin Create New User",
                security:[
                    {
                        authorization: []
                    }
                ],
                body: userSchema("createUsers"),
                response: baseResponse({
                    schema: userSchema("createUsersResponse")
                })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_USER),
        handler: AdminController.createUserByAdmin
    },
    {
        method: ["DELETE"],
        url: "/users",
        schema:{
            tags:["Admin Services"],
            summary: "Admin Delete User",
            security:[
                {
                    authorization:[]
                }
            ],
            body: userSchema("deleteUserRequest"),
            response: baseResponse({
                schema: userSchema("deleteUserResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_DELETE_USER),
        handler: AdminController.deleteUserByAdminController
    },
    {
        method:["DELETE"],
        url:"/products",
        schema: {
            tags: ["Admin Services"],
            summary: "Admin Delete Products",
            security:[
                {
                    authorization: []
                }
            ],
            body: productSchema("deleteProductRequest"),
            response: baseResponse({
                schema: productSchema("deleteProductResponse")
            })
        },
        preHandler:Auth.CheckRules(ListRules.ACCESS_DELETE_PRODUCT),
        handler:AdminController.deleteProductController
    },
    {
        method: ["GET"],
        url: "/groups",
        schema: {
            tags: ["Admin Services"],
            summary: "Get Roles List",
            security: [
                {
                    authorization: []
                }
            ],
            response: baseResponse({
                schema: userSchema("getRolesListResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_VIEW_RULES),
        handler: AdminController.getRolesList
    },
    {
        method: ["GET"],
        url: "/rules",
        schema: {
            tags: ["Admin Services"],
            summary: "Get Rules List",
            security: [
                {
                    authorization: []
                }
            ],
            response: baseResponse({
                schema: userSchema("getRulesListResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_VIEW_RULES),
        handler: AdminController.getRulesList
    },
    {
        method: ["POST"],
        url: "/groups/rules",
        schema: {
            tags: ["Admin Services"],
            security: [
                {
                    authorization: []
                }
            ],
            summary: "Add Group Rules",
            body: userSchema("createGroupRules"),
            response: baseResponse({
                schema: userSchema("createGroupRulesResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_RULES),
        handler: AdminController.addGroupRulesHandler
    },
    {
        method: ["POST"],
        url: "/users/restore",
        schema: {
            tags: ["Admin Services"],
            summary: "Admin Restore Trashed User",
            security: [
                {
                    authorization: []
                }
            ],
            body: userSchema("restoreTrashedUser"),
            response: baseResponse({
                schema: userSchema("restoreTrashedUserResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_USER),
        handler: AdminController.restoreTrashedUserController
    },
    {
        method: ["POST"],
        url: '/rules',
        schema: {
            tags: ["Admin Services"],
            summary: "Create New Rules",
            security: [
                {
                    authorization: []
                }
            ],
            body: userSchema("createRulesRequest"),
            response: baseResponse({    
                schema: userSchema("createRulesResponse")
            }),
            hide: true,
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_RULES),
        handler: AdminController.createRulesHandler
    },
    {
        method: ["DELETE"],
        url: '/groups/rules',
        schema: {
            tags: ["Admin Services"],
            summary: "Admin Revoke Group Rules",
            body: userSchema("revokeGroupRulesRequest"),
            security: [
                {
                    authorization: []
                }
            ],
            response: baseResponse({
                schema: userSchema("revokeGroupRulesResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_EDIT_RULES),
        handler: AdminController.revokeGroupRulesHandler
    },
    {
        method: ["POST"],
        url: "/logs/list",
        schema: {
            tags: ["Admin Services"],
            summary: "Get Activity Log List",
            body: logSchema("activityLogListRequest"),
            security: [
                {
                    authorization: []
                }
            ],
            response: baseResponse({
                schema: commonSchema("paginationResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_VIEW_LOG),
        handler: AdminController.activityLogListHandler
    },
    {
        method: ["POST"],
        url: "/coupons",
        schema: {
            tags: ["Admin Services", "Coupons"],
            summary: "Create New Coupon",
            security: [
                {
                    authorization: []
                }
            ],
            body: couponSchema("createCouponRequest"),
            response: baseResponse({
                schema: couponSchema("createCouponResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_PRODUCT), // Using product rule for now, could be its own rule
        handler: AdminController.createCouponHandler
    },
    {
        method: ["GET"],
        url: "/coupons",
        schema: {
            tags: ["Admin Services", "Coupons"],
            summary: "Get All Coupons",
            security: [
                {
                    authorization: []
                }
            ],
            response: baseResponse({
                schema: couponSchema("getCouponsResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_PRODUCT),
        handler: AdminController.listCouponsHandler
    },
    {
        method: ["PUT"],
        url: "/coupons",
        schema: {
            tags: ["Admin Services", "Coupons"],
            summary: "Update Coupon",
            security: [
                {
                    authorization: []
                }
            ],
            body: couponSchema("updateCouponRequest"),
            response: baseResponse({
                schema: couponSchema("updateCouponResponse")
            })
        },
        preHandler: Auth.CheckRules(ListRules.ACCESS_CREATE_PRODUCT),
        handler: AdminController.updateCouponHandler
    }
]

export default async function AdminRoutes(server: FastifyInstance) {
    server.addHook("preHandler", Auth.CheckAuth)
    server.addHook('preHandler', Log.ActivityLogging)
    for (const route of routes) {
        server.route({ ...route })
    }
}