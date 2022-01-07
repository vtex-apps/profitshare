import { ProductOrder } from "../typings/events";
// var atob = require('atob');
// var btoa = require('btoa');
var CryptoJS = require('crypto-js')
interface Params {
    key: string
    orderId: string
    orderProducts: ProductOrder[]
}

// function buildQuery(data: any) {
//   // If the data is already a string, return it as-is
//   if (typeof (data) === 'string') return data;

//   // Create a query array to hold the key/value pairs
//   var query = [];

//   // Loop through the data object
//   for (var key in data) {
//     if (data.hasOwnProperty(key)) {
//       // Encode each key and value, concatenate them into a string, and push them to the array
//       query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
//     }
//   }

//   // Join each item in the array with a `&` and return the resulting string
//   return query.join('&');
// };

function profitshareBin2hex(s: any){  
  var i, f = 0, a = [];  
  s += '';  
  f = s.length;  
    
  for (i = 0; i<f; i++) {  
      a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/,"0$1");  
  }  
    
  return a.join('');  
}  
// const atob = function(str:any){ return Buffer.from(str, 'base64').toString('binary'); }
//encode
// const btoa = function(str:any){ return Buffer.from(str, 'binary').toString('base64'); };
function getEncryption(plaintext: any, key: any): string {
  let iv = CryptoJS.enc.Utf8.parse(Math.round((Math.pow(36, 16 + 1) - Math.random() * Math.pow(36, 16))).toString(36).slice(1));

  let subKey = CryptoJS.enc.Utf8.parse(key.substring(0, 16));
  key = CryptoJS.enc.Utf8.parse(key);

  let chiperData = CryptoJS.AES.encrypt(plaintext, subKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
  });

  let hash = CryptoJS.HmacSHA256(chiperData.ciphertext, key);
  let hmac = atob(hash.toString(CryptoJS.enc.Base64));

  iv = atob(iv.toString(CryptoJS.enc.Base64));    
  let chiperRaw = atob(chiperData.toString());

  let data = profitshareBin2hex(btoa(iv + hmac + chiperRaw)); 
  console.log('Data: ', data);
  
  return data
}

async function encrypt(text: string, password: string) {
    // const encodedPlainText = encodeURIComponent(text).toString()
    let res = getEncryption(text, password);
    return res;
}

export async function encryptParams(params: Params) {
    const products = {
      external_reference: params.orderId,
      product_code: params.orderProducts.map((product: ProductOrder) => product.id).toString(),
      product_part_no: params.orderProducts.map((product: ProductOrder) => product.sku).toString(),
      product_price: params.orderProducts.map((product: ProductOrder) => product.price).toString(),
      product_name: params.orderProducts.map((product: ProductOrder) => product.name).toString(),
      product_link: params.orderProducts.map((product: ProductOrder) => window.location.origin + product.slug + '/p').toString(),
      product_category: params.orderProducts.map((product: ProductOrder) => product.categoryId).toString(),
      product_category_name: params.orderProducts.map((product: ProductOrder) => product.category).toString(),
      product_brand_code: params.orderProducts.map((product: ProductOrder) => product.brandId).toString(),
      product_brand: params.orderProducts.map((product: ProductOrder) => product.brand).toString(),
      product_qty: params.orderProducts.map((product: ProductOrder) => product.quantity).toString(),
    };

    const querystring =  new URLSearchParams(products);
    console.log(querystring);
    let res = await encrypt(querystring.toString(), params.key);

    return res;
  }

