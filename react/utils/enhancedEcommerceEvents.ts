import { PixelMessage, ProductViewData, SearchPageInfoData} from "../typings/events";
import {encryptParams} from "./encryption"

interface iframeParams {
  advertiserCode: string
  clickCode: string
  encryptedParams: string
  iframeDomain: string
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
    let iframedomain = "{{ settings.iframeDomain }}" || "c.profitshare.ro";
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

    let _ps_tg_tracking = {
      advertiser_code :window.__profitshare.advertiserCode,
      product_code :productId_window,
      product_price :price_window,
      brand_code :brandId_window,
      category_code : categoryId_window,
    }

    window.__profitshare._ps_tg = _ps_tg_tracking
}

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
    switch (e.data.eventName) {
        case 'vtex:orderPlaced': {
            const encryptedParams = await encryptParams({
              key: window.__profitshare.key,
              orderId: e.data.transactionId,
              orderProducts: e.data.transactionProducts
            })
            createIFrame({
              advertiserCode: window.__profitshare.advertiserCode,
              clickCode: window.__profitshare.clickCode,
              encryptedParams,
              iframeDomain: window.__profitshare.iframeDomain
            })
        }
      case 'vtex:productView':
      {
        sendProductTrackingInfo(e);
      }
      case 'vtex:pageInfo': {
        const eventData = e.data as SearchPageInfoData
        const { eventType } = eventData
        if(eventType === 'categoryView'){
          sendProductTrackingInfo(e);
        }
      }
      default: {
        return
      }
   }
}

