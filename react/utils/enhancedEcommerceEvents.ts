import { OrderPlacedData, PixelMessage, ProductViewData, SearchPageInfoData} from "../typings/events";
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
    var _ps_tgt_ = {
      a: window.__profitshare.advertiserCode,
      pc: productId_window,
      pp: price_window,
      cc: categoryId_window,
      bc: brandId_window
    }
    window.localStorage.setItem('_ps_tgt', JSON.stringify(_ps_tgt_));
}

function sendCategoryTrackingInfo(e: PixelMessage) {
  const {
    category,
  } = (e.data as SearchPageInfoData)
  let categoryId_window = category?.id ? category?.id : '0'
    var _ps_tgt_ = {
      cc: categoryId_window,
    }
    window.localStorage.setItem('_ps_tgt', JSON.stringify(_ps_tgt_));
}

async function sendConversionCode(e: PixelMessage){
  const eventData = e.data as OrderPlacedData
  const encryptedParams = await encryptParams({
    key: window.__profitshare?.key,
    orderId: eventData.transactionId,
    orderProducts: eventData.transactionProducts,
    taxCode:  window.__profitshare?.taxCode
  })
  createIFrame({
    advertiserCode: window.__profitshare?.advertiserCode,
    clickCode: window.__profitshare?.clickCode,
    encryptedParams,
    iframedomain: window.__profitshare?.iframeDomain
  })
}

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
    switch (e.data.eventName) {
      case 'vtex:orderPlacedTracked':
      case 'vtex:orderPlaced':
      {
        sendConversionCode(e)
        break;
      }
      case 'vtex:productView':
      {
        sendProductTrackingInfo(e);
        break;
      }
      case 'vtex:pageInfo': {
        const eventData = e.data as SearchPageInfoData
        const { eventType } = eventData
        if(eventType === 'categoryView'){
          sendCategoryTrackingInfo(e);
          break;
        }
      }
      default: {
        return
      }
   }
}

