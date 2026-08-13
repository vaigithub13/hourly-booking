import { ProductLength } from "./product-length.model";

export interface ICreateProductLength {
  length: number;
  available?: boolean;
}

export interface IUpdateProductLength {
  id: number;
  length?: number;
  available?: boolean;
}

export interface IProductLengthResponse {
  id: number;
  length: number;
  available: boolean;
}

export interface IGetProductLengthsQuery {
  available?: boolean;
}

export const productLengthResponse = (
  productLength: ProductLength
): IProductLengthResponse => {
  const { id, length, available } = productLength;
  return { id, length, available };
};
