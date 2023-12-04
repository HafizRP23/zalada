import db from "@database";
import { Product } from "@entities";

export async function DBGetProducts() {
  const product = await db.query<Product[]>("SELECT * FROM products");
  return product;
}

export async function DBOrderProduct() {
  const order = await db.query<Product[]>(`SELECT id, name, quantity, price FROM product WHERE name = ? AND quantity = ?`);
  return order
}
