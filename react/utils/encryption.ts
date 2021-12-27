import { ProductOrder } from "../typings/events";
import axios from 'axios';
// import crypto from 'crypto'

interface Params {
    key: string
    orderId: string
    orderProducts: ProductOrder[]
}

function buildQuery(data: any) {
  // If the data is already a string, return it as-is
  if (typeof (data) === 'string') return data;

  // Create a query array to hold the key/value pairs
  var query = [];

  // Loop through the data object
  for (var key in data) {
    if (data.hasOwnProperty(key)) {

      // Encode each key and value, concatenate them into a string, and push them to the array
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
  }

  // Join each item in the array with a `&` and return the resulting string
  return query.join('&');
};

const BASE_URL = "/_v/encryption"
async function encrypt(text: string, password: string) {
  let result  =''
  try{
    result = await axios.get(`${BASE_URL}?plaintext=${text}&key=${password}`);
  }
  catch(errors){
    console.error(errors);
  }
  let encryption = JSON.parse(JSON.stringify(result)).data.result;

  return encryption;
}


export async function encryptParams(params: Params) {
    const products = [{
      external_reference: params.orderId,
      product_code: params.orderProducts.map((product: ProductOrder) => product.id),
      product_part_no: params.orderProducts.map((product: ProductOrder) => product.sku),
      product_price: params.orderProducts.map((product: ProductOrder) => product.price),
      product_name: params.orderProducts.map((product: ProductOrder) => product.name),
      product_link: params.orderProducts.map((product: ProductOrder) => window.location.origin + product.slug + '/p'),
      product_category: params.orderProducts.map((product: ProductOrder) => product.categoryId),
      product_category_name: params.orderProducts.map((product: ProductOrder) => product.category),
      product_brand_code: params.orderProducts.map((product: ProductOrder) => product.brandId),
      product_brand: params.orderProducts.map((product: ProductOrder) => product.brand),
      product_qty: params.orderProducts.map((product: ProductOrder) => product.quantity),
    }];

    const querystring = buildQuery(products);
    let res = await encrypt(querystring, params.key);

    return res;
  }

