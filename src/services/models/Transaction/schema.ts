import { File } from "fastify-multer/lib/interfaces"
import { buildJsonSchemas } from "fastify-zod"
import * as z from "zod"

const createOrder = z.object({
    product_id: z.number(),
    quantity: z.number().min(1)
})

const createOrders = z.array(createOrder)

export const createOrderRequest = z.object({
    order: z.union([createOrder, createOrders]),
    payment_type: z.number(),
    address: z.string(),
    notes: z.string().optional(),
    coupon_code: z.string().optional()
})

export const createOrderResponse = z.object({
    message: z.object({
        order_no: z.string(),
        total_price: z.number(),
        stock: z.union([z.number(), z.record(z.string(), z.number())])
    })
})

const getPaymentType = z.object({
    id: z.number(),
    bank_name: z.string(),
    account: z.string()
})

export const getPaymentTypesResponse = z.object({
    message: z.array(getPaymentType)
})

export const productList = z.object({
    product_id: z.number(),
    product_name: z.string(),
    price: z.number(),
    quantity: z.number()
})

export const confirmOrderRequest = z.object({
  order_no: z.string(),
})

export const transactionListResponse = z.object({
    message: z.object({
        order_no: z.string(),
        items: z.array(productList),
        status: z.number(),
        customer_name: z.string(),
        order_time: z.string(),
        payment_type: z.string(),
        verified_by: z.string(),
        total_price: z.number()
    }).array()
})



export const paymentOrderRequest = z.object({
    order_no: z.string(),
    amount: z.number().min(1)
})

export const paymentOrderResponse = z.object({
    message: z.boolean()
})



export const getOrderDetailsRequest = z.object({
    order_no: z.string()
})


const orders = z.object({
    product_id: z.number(),
    product_name: z.string(),
    price: z.number(),
    quantity: z.number(),
})

export const getOrderDetailsResponse = z.object({
    message: z.object({
        order_no: z.string(),
        payment_type: z.string(),
        status: z.number(),
        created_at: z.number(),
        address: z.string(),
        payment_at: z.number().nullable(),
        shipping_at: z.number().nullable(),
        arrived_at: z.number().nullable(),
        notes: z.string().nullable(),
        items: z.array(orders)
    })
})

export const confirmOrderResponse = z.object({
    message: z.boolean()
})

export const changeDeliveryStatusRequest = z.object({
    order_no: z.string(),
})

export const setDeliveryRequest = z.object({
    order_no: z.string()
})

const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const setArrivedSchema = z.object({
    attachment: z.custom<Required<File>>().refine(file => file != undefined, "ATTACHMENT_IS_REQUIRED")
        .refine(file => imageTypes.includes(file.mimetype), "INVALID_FILE_TYPE")
        .refine(file => (file.size / 1000) < 2048, { message: "FILE_SIZE_TOO_BIG" }),
    order_no: z.string({ required_error: "order_no is required!" })
})

export const setDeliveryResponse = z.object({
    message: z.boolean()
})

export const setArrivedResponse = z.object({
    message: z.boolean()
})

export const changeDeliveryStatusResponse = z.object({
    message: z.boolean()
})

export const finishOrderRequest = z.object({
    order_no: z.string()
})

export const finishOrderResponse = z.object({
    message: z.boolean()
})


export const getTransactionListRequest = z.object({
    limit: z.number().optional(),
    sort: z.enum(['DESC', 'ASC']).optional(),
    search: z.string().optional().describe(JSON.stringify({ no: "number", status: "number", payment_type: "number", created_at: "number", payment_at: "number", shipping_at: "number", arrived_at: "number", order_no: "string" })),
    lastId: z.number().optional()
})

export const readyDeliveryListResponse = z.object({
    message: z.object({
        order_no: z.string(),
        address: z.string(),
        fullname: z.string(),
        phone_number: z.string(),
        orders: z.array(orders)
    }).array()
})

export const onDeliveryListResponse = z.object({
    message: z.object({
        order_no: z.string(),
        address: z.string(),
        fullname: z.string(),
        phone_number: z.string(),
        orders: z.array(orders)
    }).array()
})

export const orderListRequest = z.object({
    limit: z.number().optional(),
    sort: z.enum(["DESC", "ASC"]).optional(),
    search: z.string().optional().describe(JSON.stringify({ no: "number", status: "number", payment_type: "number", created_at: "number", payment_at: "number", shipping_at: "number", arrived_at: "number", order_no: "string" })),
    lastId: z.number().optional()  
})

export const cancelOrderRequest = z.object({
    order_no: z.string()
})

export const cancelOrderResponse = z.object({
    message: z.boolean()
})

export const confirmedOrderListResponse = z.object({
    message: z.object({
        order_no: z.string(),
        address: z.string(),
        phone_number: z.string(),
        fullname: z.string(),
        orders: z.array(orders)
    }).array()
})

export const transactionDetailsRequest = z.object({
    order_no: z.string()
})

export const transactionDetailsResponse = z.object({
    message: z.object({
        order_no: z.string(),
        payment_type: z.string(),
        status: z.number(),
        created_at: z.number(),
        address: z.string(),
        verified_by: z.string(),
        payment_at: z.number().nullable(),
        shipping_at: z.number().nullable(),
        arrived_at: z.number().nullable(),
        attachment: z.number().nullable(),
        notes: z.string().nullable(),
        items: z.array(orders)
    })
})

export const { schemas: transactionSchemas, $ref: transactionSchema } = buildJsonSchemas({
    createOrderRequest,
    createOrderResponse,
    getPaymentTypesResponse,
    productList,
    transactionListResponse,
    getTransactionListRequest,
    paymentOrderRequest,
    paymentOrderResponse,
    getOrderDetailsRequest,
    getOrderDetailsResponse,
    finishOrderRequest,
    finishOrderResponse,
    confirmOrderRequest,
    confirmOrderResponse,
    changeDeliveryStatusRequest,
    setDeliveryRequest,
    setDeliveryResponse,
    setArrivedResponse,
    changeDeliveryStatusResponse,
    readyDeliveryListResponse,
    onDeliveryListResponse,
    orderListRequest,
    cancelOrderRequest,
    cancelOrderResponse,
    confirmedOrderListResponse,
    transactionDetailsRequest,
    transactionDetailsResponse
}, {
    $id: "transactionSchema"
})
