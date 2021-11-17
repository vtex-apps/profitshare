import { canUseDOM } from 'vtex.render-runtime'
import { PixelMessage} from './typings/events'
import { sendEnhancedEcommerceEvents } from './utils/enhancedEcommerceEvents'

export async function handleEvents(e: PixelMessage) {
  sendEnhancedEcommerceEvents(e);
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
