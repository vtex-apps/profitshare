import { OrderPlacedTrackedData, PixelMessage, ProductViewData, SearchPageInfoData} from "../typings/events";
import {encryptParams} from "./encryption"

interface iframeParams {
  advertiserCode: string
  clickCode: string
  encryptedParams: string
  iframedomain: string
}

function getCookie(name: string) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : '';
}

function createIFrame(params: iframeParams) {
    const clickCookie = getCookie(params.clickCode);
    const iframe = document.createElement('iframe')
    iframe.height = '1'
    iframe.width = '1'
    iframe.scrolling = 'no'
    iframe.marginHeight = '0'
    iframe.marginWidth = '0'
    let iframedomain = params.iframedomain  || "c.profitshare.ro";
    iframe.src = `https://${iframedomain}/ca/0/${params.advertiserCode}/p/${params.encryptedParams}?click_code=${clickCookie}`
    document.body.appendChild(iframe)
}

function sendProductTrackingInfo(e: PixelMessage) {
      const {
        productId,
        categoryId,
        brandId,
        items
    } = (e.data as ProductViewData).product

    let price_window = 0
    let productId_window = productId ? productId : '0'
    let categoryId_window = categoryId ? categoryId : '0'
    let brandId_window = brandId ? brandId : '0'
    if(items && items[0] && items[0].seller){
      price_window = items[0].seller.commertialOffer?.Price
    } else if (items && items[0] && items[0].sellers!=null){
      let seller = items[0].sellers.filter(item => item.sellerId == '1').find(item=> item!==undefined)
      price_window = seller ? seller.commertialOffer?.Price : price_window
    }

    var s =document.createElement("script"); 
    s.type = "text/javascript";
    s.onload = function () {
      var _ps_tgt_ = {
        a: window.__profitshare.advertiserCode,
        pc: productId_window,
        pp: price_window,
        cc: categoryId_window,
        bc: brandId_window
      }
      return _ps_tgt_
    }

    let cookieScriptDomain = window.__profitshare.cookieScriptDomain || "t.profitshare.ro";
    s.src = `https://${cookieScriptDomain}/tgt/js`;
    document.head.appendChild(s);
}

async function sendConversionCode(e: PixelMessage){
  const eventData = e.data as OrderPlacedTrackedData
  const encryptedParams = await encryptParams({
    key: window.__profitshare.key,
    orderId: eventData.transactionId,
    orderProducts: eventData.transactionProducts
  })
  createIFrame({
    advertiserCode: window.__profitshare.advertiserCode,
    clickCode: window.__profitshare.clickCode,
    encryptedParams,
    iframedomain: window.__profitshare.iframeDomain
  })
}

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
  console.log('Event name: ', e.data.eventName);
    switch (e.data.eventName) {
        case 'vtex:orderPlacedTracked': {
          console.log("Order placed")
          sendConversionCode(e)
        }
      case 'vtex:productView':
      {
        console.log("Product View")
        sendProductTrackingInfo(e);
      }
      case 'vtex:pageInfo': {
        const eventData = e.data as SearchPageInfoData
        const { eventType } = eventData
        if(eventType === 'categoryView'){
          console.log("Catgeory View")
          sendProductTrackingInfo(e);
        }
      }
      default: {
        return
      }
   }
}

