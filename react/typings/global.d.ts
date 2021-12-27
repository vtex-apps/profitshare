interface Window extends Window {
  __profitshare: {
    cookieScriptName: string
    clickCode: string
    advertiserCode: string
    key: string
    iframeDomain: string
    cookieScriptDomain: string
    _ps_tgt: TrackingObject
  }
}

interface TrackingObject {
  a: string
  pc: string
  pp: number
  cc: string
  bc: string
}
