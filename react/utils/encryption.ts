import { ProductOrder } from "../typings/events";


interface Params {
    key: string
    orderId: string
    orderProducts: ProductOrder[]
}

const AES_METHOD = 'aes-128-cbc';
const IV_LENGTH = 16;
declare const Buffer: any;


const encode = (data: any) => {
  const encoder = new TextEncoder()

  return encoder.encode(data)
}

const generateIv = () => {
  return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}


function bin2hex (s: string) {
    var i
    var l
    var o = ''
    var n
  
    s += ''
  
    for (i = 0, l = s.length; i < l; i++) {
      n = s.charCodeAt(i)
        .toString(16)
      o += n.length < 2 ? '0' + n : n
    }
  
    return o
}
  
function ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
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

async function encrypt(text: string, password: string) {
    const encoded = encode(text)
    const iv = generateIv()
    const pwUtf8 = new TextEncoder().encode(password)
    const pwHash = await window.crypto.subtle.digest('SHA-256', pwUtf8) 
    const alg = { name: AES_METHOD, iv: iv }
    const key = await window.crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt'])
  
    const ctBuffer = await window.crypto.subtle.encrypt(alg, key, encoded)    
    const signature = await window.crypto.subtle.sign("HMAC", key, ctBuffer)
    return bin2hex(ab2str(signature))
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
    return await encrypt(querystring, params.key);
  }
