import { canUseDOM } from 'vtex.render-runtime'
import { PixelMessage, ProductOrder } from './typings/events'
import crypto from 'crypto'

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

function getCookie(name: string) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : '';
}

interface iframeParams {
  advertiserCode: string
  clickCode: string
  encryptedParams: string
}

function createIFrame(params: iframeParams) {

  const clickCookie = getCookie(params.clickCode);
  
  const iframe = document.createElement('iframe')
  iframe.height = '1'
  iframe.width = '1'
  iframe.scrolling = 'no'
  iframe.marginHeight = '0'
  iframe.marginWidth = '0'
  iframe.src = `https://c.profitshare.ro/ca/0/${params.advertiserCode}/p/${params.encryptedParams}?click_code=${clickCookie}`

  document.body.appendChild(iframe)
}

function bin2hex (s: string) {
  //  discuss at: https://locutus.io/php/bin2hex/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (https://locutus.io/php/bin2hex:361#comment_177616)
  //   example 1: bin2hex('Kev')
  //   returns 1: '4b6576'
  //   example 2: bin2hex(String.fromCharCode(0x00))
  //   returns 2: '00'

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

const AES_METHOD = 'aes-128-cbc';
const IV_LENGTH = 16;
declare const Buffer: any;

function encrypt(text: string, key: string) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(AES_METHOD, new Buffer(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const hash = crypto.createHmac('sha256', key)
              .update(encrypted)
              .digest('base64');

  return bin2hex(hash);
}


interface Params {
  key: string
  orderId: string
  orderProducts: ProductOrder[]
}

function encryptParams(params: Params) {

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
  return encrypt(querystring, params.key);
}

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:orderPlaced': {
      const encryptedParams = encryptParams({
        key: window.__profitshare.key, 
        orderId: e.data.transactionId,
        orderProducts: e.data.transactionProducts
      })
      createIFrame({
        advertiserCode: window.__profitshare.advertiserCode,
        clickCode: window.__profitshare.clickCode,
        encryptedParams
      })
    }
    default: {
      return
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
