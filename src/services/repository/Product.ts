import db from "@database";
import * as ProductDto from "../models/Product";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";
import { NotFoundError, ServerError } from "src/config/error";

export async function DBGetProducts({limit = 500, search = "1=1", sort = "DESC"}: ProductDto.GetProductsQueryParams) {
  return await db.query<ProductDto.GetProductsQueryResult>(`SELECT * FROM products WHERE ${search} ORDER BY id ${sort} LIMIT ${limit + 1}`);
}

export async function DBAddProductByAdmin(params: ProductDto.AddProductByAdmin  ) {
  const {name,stock,description,price} = params
  const query = await db.query<ProductDto.AddProductByAdmin[]>(
    "INSERT INTO products( name, stock, description, price,store_id ) VALUES (?,?,?,?,1)",[name,stock,description,price]
  )

  return query
}

export async function DBCheckProductExist(product_id: number) {
  const query = await db.query<ProductDto.GetProductQueryResult[]>("SELECT * FROM products WHERE id = ?", [product_id])

  if(query.length < 1) {
    throw new NotFoundError("PRODUCT_NOT_FOUND")
  }

  return query[0]
}


export async function DBUpdateProduct({ description, name, price, stock, product_id }: ProductDto.UpdateProductQueryParams, queryRunner?: QueryRunner) {
  const values = [name, stock, description, price, product_id]
  const query = await db.query<ResultSetHeader>("UPDATE products SET name = ?, stock = ?, description = ?, price = ? WHERE id = ?", values, queryRunner)

  if(query.affectedRows < 1) {
    throw new NotFoundError("FAILED_UPDATE_PRODUCT")
  }

  return query
}


export async function DBUpdateStockProduct({product_id, stock}: ProductDto.UpdateStockQueryParams, queryRunner?: QueryRunner) {
  const query = await db.query<ResultSetHeader>("UPDATE products SET stock = ? WHERE id = ? ", [stock, product_id], queryRunner)

  if(query.affectedRows < 1) {
    throw new ServerError("FAILED_TO_UPDATE_STOCK")
  }

  return query
}