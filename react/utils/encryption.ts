import axios from "axios";
import { ProductOrder } from "../typings/events";

var CryptoJS = require('crypto-js')
interface Params {
    key: string
    orderId: string
    orderProducts: ProductOrder[]
}

function profitshareBin2hex(s: any){  
  var i, f = 0, a = [];  
  s += '';  
  f = s.length;  
    
  for (i = 0; i<f; i++) {  
      a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/,"0$1");  
  }  
    
  return a.join('');  
}  

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
  
  return data
}

async function encrypt(text: string, password: string) {
    let res = getEncryption(text, password);
    return res;
}

async function getIpData(){
  const res = await axios.get('https://api.ipify.org/?format=json');
  return res.data.ip;
}

export async function encryptParams(params: Params) {
    var productsList:any ={};
    productsList['external_reference'] = params.orderId;
    productsList['user_agent'] = navigator.userAgent;
    productsList['user_ip'] =  await getIpData();

    for(let i=0; i<params.orderProducts.length; i++){
      productsList['product_code['+i.toString()+']'] = params.orderProducts[i].id;
      productsList['product_part_no['+i.toString()+']'] = params.orderProducts[i].sku;
      productsList['product_name['+i.toString()+']'] = params.orderProducts[i].name;
      productsList['product_link['+i.toString()+']'] = window.location.origin + '/' + params.orderProducts[i].slug + '/p'
      productsList['product_category['+i.toString()+']'] = params.orderProducts[i].categoryId;
      productsList['product_category_name['+i.toString()+']'] = params.orderProducts[i].category;
      productsList['product_brand_code['+i.toString()+']'] = params.orderProducts[i].brandId;
      productsList['product_brand['+i.toString()+']'] = params.orderProducts[i].brand;
      productsList['product_qty['+i.toString()+']'] = params.orderProducts[i].quantity;
      
      if(window.__profitshare.taxCode){
        let taxCode = window.__profitshare?.taxCode
        let withoutVAT = Math.ceil((params.orderProducts[i].sellingPrice * (1-taxCode/100))*100)/100
        params.orderProducts[i].sellingPrice = withoutVAT;
      } else {
        window.__profitshare.taxCode = 0;
      }
      productsList['product_price['+i.toString()+']'] = params.orderProducts[i].sellingPrice;
    }
    const querystring =  new URLSearchParams(productsList);
    let res = await encrypt(querystring.toString(), params.key);

    return res;
  }



