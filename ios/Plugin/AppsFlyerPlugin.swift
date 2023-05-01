import Foundation
import Capacitor
import AppsFlyerLib


@objc(AppsFlyerPlugin)
public class AppsFlyerPlugin: CAPPlugin {
  private var conversion = true
  private var oaoa = true
  private var udl = false
  
  override public func load() {
    
    NotificationCenter.default.addObserver(self, selector: #selector(self.handleUrlOpened(notification:)), name: Notification.Name.capacitorOpenURL, object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(self.handleUniversalLink(notification:)), name: Notification.Name.capacitorOpenUniversalLink, object: nil)
    
  }
  
  
  @objc func initSDK(_ call: CAPPluginCall){
    let appsflyer = AppsFlyerLib.shared()
    guard  let devKey = call.getString(AppsFlyerConstants.AF_DEV_KEY) else{
      call.reject("devkey is missing")
      return
    }
    guard  let appID = call.getString(AppsFlyerConstants.AF_APP_ID) else{
      call.reject("appID is missing")
      return
    }
    let attInterval = call.getInt(AppsFlyerConstants.AF_ATT)
    
    let debug = call.getBool(AppsFlyerConstants.AF_DEBUG, false)
    let sandbox = call.getBool(AppsFlyerConstants.AF_SANDBOX, false)
    let receiptSandbox = call.getBool(AppsFlyerConstants.AF_RECEIPT_SANDBOX , false)
    
    conversion = call.getBool(AppsFlyerConstants.AF_CONVERSION_LISTENER, true)
    oaoa = call.getBool(AppsFlyerConstants.AF_OAOA, true)
    udl = call.getBool(AppsFlyerConstants.AF_UDL, false)
    
    appsflyer.isDebug = debug
    appsflyer.appsFlyerDevKey = devKey
    appsflyer.appleAppID = appID
    appsflyer.useUninstallSandbox = sandbox
    appsflyer.useReceiptValidationSandbox = receiptSandbox
    
    if let minTime = call.getInt(AppsFlyerConstants.AF_MIN_TIME){
      appsflyer.minTimeBetweenSessions = UInt(minTime)
    }
    
    if let timeout = call.getInt(AppsFlyerConstants.AF_DEEP_LINK_TIME_OUT){
      appsflyer.deepLinkTimeout = UInt(timeout)
    }
    
    if conversion || oaoa {
      appsflyer.delegate = self
    }
    
    if udl {
      appsflyer.deepLinkDelegate = self
    }
    
    reportBridgeReady()
    
#if !AFSDK_NO_IDFA
    if attInterval != nil {
      appsflyer.waitForATTUserAuthorization(timeoutInterval: Double(attInterval!))
    }
#endif
    
    NotificationCenter.default.addObserver(self, selector: #selector(sendLaunch), name: UIApplication.didBecomeActiveNotification, object: nil)
    
    appsflyer.start(completionHandler: { (dictionnary, error) in
      if (error != nil){
        call.reject(error!.localizedDescription)
        return
      } else {
        call.resolve(["res":"ok"])
        return
      }
    })
  }
  
  @objc func logEvent(_ call: CAPPluginCall){
    guard let eventName = call.getString(AppsFlyerConstants.AF_EVENT_NAME) else{
      call.reject("missing event name")
      return
    }
    let eventValue = call.getObject(AppsFlyerConstants.AF_EVENT_VALUE)
    
    AppsFlyerLib.shared().logEvent(name: eventName, values: eventValue) {  (response: [String : Any]?, error: Error?) in
      if let response = response {
        call.resolve(["res":response])
      }
      if let error = error {
        call.reject(error.localizedDescription, nil, error)
      }
    }
  }
  
  @objc func setCustomerUserId(_ call: CAPPluginCall){
    guard  let cuid = call.getString(AppsFlyerConstants.AF_CUID) else {
      call.reject("Invalid Customer User ID")
      return
    }
    AppsFlyerLib.shared().customerUserID = cuid
    
  }
  
  @objc func setCurrencyCode(_ call: CAPPluginCall){
    guard  let code = call.getString(AppsFlyerConstants.AF_CURRENCY_CODE) else {
      call.reject("Invalid Currency Code")
      return
    }
    AppsFlyerLib.shared().currencyCode = code
    
    
  }
  
  @objc func updateServerUninstallToken(_ call: CAPPluginCall){
    guard  let token = call.getString(AppsFlyerConstants.AF_TOKEN) else {
      call.reject("Invalid device token")
      
      return
    }
    
    guard let deviceTokenData = token.hexadecimalToData else{
      call.reject("Invalid device token")
      return
    }
    AppsFlyerLib.shared().registerUninstall(deviceTokenData)
  }
  
  @objc func setAppInviteOneLink(_ call: CAPPluginCall){
    guard  let id = call.getString(AppsFlyerConstants.AF_ONELINK_ID) else {
      call.reject("Onelink id is missing")
      return
    }
    AppsFlyerLib.shared().appInviteOneLinkID = id
    
  }
  
  @objc func setOneLinkCustomDomain(_ call: CAPPluginCall){
    guard  let arr = call.getArray(AppsFlyerConstants.AF_ONELINK_DOMAIN) else {
      call.reject("Domains are missing")
      return
    }
    var domains :[String] = []
    for dom in arr {
      domains.append(dom as! String)
    }
    AppsFlyerLib.shared().oneLinkCustomDomains = domains
    
  }
  
  @objc func appendParametersToDeepLinkingURL(_ call: CAPPluginCall){
    guard  let contains = call.getString(AppsFlyerConstants.AF_CONTAINS) else {
      return
    }
    guard  let parameters = call.getObject(AppsFlyerConstants.AF_PARAMETERS) else {
      return
    }
    var params: [String:String] = [:]
    for (k,v) in parameters{
      params[k] = (v as! String)
    }
    AppsFlyerLib.shared().appendParametersToDeeplinkURL(contains: contains, parameters:params )
    
  }
  
  
  @objc func setResolveDeepLinkURLs(_ call: CAPPluginCall){
    guard  let arr = call.getArray(AppsFlyerConstants.AF_DEEPLINK_URLS) else {
      call.reject("URLs are missing")
      return
    }
    var urls :[String] = []
    for url in arr {
      urls.append(url as! String)
    }
    AppsFlyerLib.shared().oneLinkCustomDomains = urls
    
  }
  
  @objc func addPushNotificationDeepLinkPath(_ call: CAPPluginCall){
    guard  let arr = call.getArray(AppsFlyerConstants.AF_PATH) else {
      call.reject("Path is missing")
      return
    }
    var path :[String] = []
    for p in arr {
      path.append(p as! String)
    }
    AppsFlyerLib.shared().addPushNotificationDeepLinkPath(path)
    
  }
  
  @available(*, deprecated, message: "Use setSharingFilterForPartners")
  @objc func setSharingFilter(_ call: CAPPluginCall){
    let filters = call.getArray(AppsFlyerConstants.AF_FILTERS , String.self)
    
    AppsFlyerLib.shared().sharingFilter = filters
    
  }
  
  @available(*, deprecated, message: "Use setSharingFilterForPartners")
  @objc func setSharingFilterForAllPartners(_ call: CAPPluginCall){
    
    AppsFlyerLib.shared().setSharingFilterForAllPartners()
    
  }
  
  @objc func setSharingFilterForPartners(_ call: CAPPluginCall){
    guard let filters = call.getArray(AppsFlyerConstants.AF_FILTERS , String.self) else{
      return call.reject("cannot extract the filters value")
    }
    
    AppsFlyerLib.shared().setSharingFilterForPartners(filters)
    
  }
  
  @objc func setAdditionalData(_ call: CAPPluginCall){
    guard  let data = call.getObject(AppsFlyerConstants.AF_ADDITIONAL_DATA) else {
      call.reject("Data is missing")
      return
    }
    AppsFlyerLib.shared().customData = data
    
  }
  
  
  @objc func getAppsFlyerUID(_ call: CAPPluginCall){
    let uid = AppsFlyerLib.shared().getAppsFlyerUID()
    call.resolve(["uid":uid])
    
  }
  
  @objc func setDisableNetworkData(_ call: CAPPluginCall){
    call.unavailable("Android only method - has no effact on iOS apps")
  }

  @objc func anonymizeUser(_ call: CAPPluginCall){
    guard let anonymize = call.getBool(AppsFlyerConstants.AF_ANONYMIZE_USER) else{
      call.reject("Missing boolean value anonymizeUser")
      return
    }
    AppsFlyerLib.shared().anonymizeUser = anonymize
    
  }
  
  @objc func stop(_ call: CAPPluginCall){
    let stop = call.getBool(AppsFlyerConstants.AF_STOP)
    if stop != nil {
      AppsFlyerLib.shared().isStopped = stop!
    }
    call.resolve([AppsFlyerConstants.AF_IS_STOP : AppsFlyerLib.shared().isStopped ])
  }
  
  @objc func disableSKAdNetwork(_ call: CAPPluginCall){
    guard let disable = call.getBool(AppsFlyerConstants.AF_DISABLE_SKAD) else {
      call.reject("Missing boolean value shouldDisable")
      return
    }
    AppsFlyerLib.shared().disableSKAdNetwork = disable
    
  }
  
#if !AFSDK_NO_IDFA
  @objc func disableAdvertisingIdentifier(_ call: CAPPluginCall){
    guard let disable = call.getBool(AppsFlyerConstants.AF_DISABLE_SKAD) else {
      call.reject("Missing boolean value shouldDisable")
      return
    }
    AppsFlyerLib.shared().disableAdvertisingIdentifier = disable
    
  }
#endif
  
  @objc func disableCollectASA(_ call: CAPPluginCall){
    guard let disable = call.getBool(AppsFlyerConstants.AF_DISABLE_SKAD) else {
      call.reject("Missing boolean value shouldDisable")
      return
    }
    AppsFlyerLib.shared().disableCollectASA = disable
    
  }
  @objc func setHost(_ call: CAPPluginCall){
    let pre = call.getString(AppsFlyerConstants.AF_HOST_PREFIX)
    let post = call.getString(AppsFlyerConstants.AF_HOST_POSTFIX)
    if (pre != nil && post != nil) {
      AppsFlyerLib.shared().setHost(post!, withHostPrefix: pre!)
    } else {
      call.reject("Missing host prefix and/or host name")
    }
  }
  
  @objc func generateInviteLink(_ call: CAPPluginCall){
    AppsFlyerShareInviteHelper.generateInviteUrl(linkGenerator:
                                                  {(_ generator: AppsFlyerLinkGenerator) -> AppsFlyerLinkGenerator in
      if let channel = call.getString(AppsFlyerConstants.AF_CHANNEL){
        generator.setChannel(channel)
      }
      if let brandDomain = call.getString(AppsFlyerConstants.AF_BRAND_DOMAIN){
        generator.brandDomain = brandDomain
      }
      if let campaign = call.getString(AppsFlyerConstants.AF_CAMPAIGN){
        generator.setCampaign(campaign)
      }
      if let referrerName = call.getString(AppsFlyerConstants.AF_REFERRER_NAME){
        generator.setReferrerName(referrerName)
      }
      if let referrerImageURL = call.getString(AppsFlyerConstants.AF_REFERRER_IMAGE_URL){
        generator.setReferrerImageURL(referrerImageURL)
      }
      if let referrerCustomerId = call.getString(AppsFlyerConstants.AF_REFERRER_CUSTOMER_ID){
        generator.setReferrerCustomerId(referrerCustomerId)
      }
      if let baseDeeplink = call.getString(AppsFlyerConstants.AF_BASE_DEEPLINK){
        generator.setBaseDeeplink(baseDeeplink)
      }
      if let addParameters = call.getObject(AppsFlyerConstants.AF_ADD_PARAMETERS){
        generator.addParameters(addParameters)
      }
      
      return generator },completionHandler: {url in
        if url != nil{
          call.resolve([AppsFlyerConstants.AF_LINK_READY: url!.absoluteString])
        }else{
          call.reject("Failed to generate a link")
        }
      }
    )
    
  }
  @objc func validateAndLogInAppPurchaseAndroid(_ call: CAPPluginCall){
    call.unavailable()
  }
  
  @objc func validateAndLogInAppPurchaseIos(_ call: CAPPluginCall){
    let currency = call.getString(AppsFlyerConstants.AF_CURRENCY)
    let price = call.getString(AppsFlyerConstants.AF_PRICE)
    let _inAppPurchase = call.getString(AppsFlyerConstants.AF_IN_APP_PURCHASE)
    let transactionId = call.getString(AppsFlyerConstants.AF_TRANSACTION_ID)
    let additionalParameters = call.getObject(AppsFlyerConstants.AF_ADDITIONAL_PARAMETERS) ?? [:]
    
    if currency != nil && price != nil && _inAppPurchase != nil && transactionId != nil && currency != nil   {
      AppsFlyerLib.shared().validateAndLog(
        inAppPurchase: _inAppPurchase,
        price: price,
        currency: currency,
        transactionId: transactionId,
        additionalParameters: additionalParameters,
        success: {result in
          call.resolve(["res":result])
        },
        failure: { error, result in
          guard let emptyInApp = result as? [String:Any]
          else
          {
            call.reject((error)?.localizedDescription ?? "error" )
            return
          }
          call.reject((error)?.localizedDescription ?? "error" , emptyInApp.jsonStringRepresentation)
          
        })
    }else{
      call.reject("Missing some fields")
    }
    
    
  }
  
  @objc func getSdkVersion(_ call: CAPPluginCall){
    
    call.resolve(["res": AppsFlyerLib.shared().getSDKVersion()])
  }
  
  @objc func enableFacebookDeferredApplinks(_ call: CAPPluginCall){
    guard  let enable = call.getBool(AppsFlyerConstants.AF_FB) else {
      call.reject("missing boolean value: \(AppsFlyerConstants.AF_FB)")
      return
    }
    if enable{
#if canImport(FacebookCore)
      AppsFlyerLib.shared().enableFacebookDeferredApplinks(with: FBSDKAppLinkUtility.self)
      call.resolve(["res": "enabled"])
#else
      call.reject("Please install FBSDK First!")
#endif
    }else{
      AppsFlyerLib.shared().enableFacebookDeferredApplinks(with: nil)
      call.resolve(["res": "disabled"])
      
    }
    
  }
  
  @objc func sendPushNotificationData(_ call: CAPPluginCall){
    let json = call.getObject(AppsFlyerConstants.AF_PUSH_PAYLOAD)
    AppsFlyerLib.shared().handlePushNotification(json)
    
  }
  
  
  @objc func setCurrentDeviceLanguage(_ call: CAPPluginCall){
    guard let language = call.getString(AppsFlyerConstants.AF_LANGUAGE) else {
      call.reject("cannot extract the language value")
      return
    }
    AppsFlyerLib.shared().currentDeviceLanguage = language
    call.resolve(["res": "ok"])
    
  }
  
  @objc func logCrossPromoteImpression(_ call: CAPPluginCall){
    guard let appID = call.getString(AppsFlyerConstants.AF_APP_ID) else {
      call.reject("cannot extract the appID value")
      return
    }
    guard let campaign = call.getString(AppsFlyerConstants.AF_CAMPAIGN) else {
      call.reject("cannot extract the campaign value")
      return
    }
    guard let parameters = call.getObject(AppsFlyerConstants.AF_PARAMETERS) else {
      call.reject("cannot extract the parameters value")
      return
    }
    AppsFlyerCrossPromotionHelper.logCrossPromoteImpression(appID, campaign: campaign, parameters: parameters)
    call.resolve(["res": "ok"])
    
  }
  
  @objc func setUserEmails(_ call: CAPPluginCall){
    guard let emails = call.getArray(AppsFlyerConstants.AF_EMAILS, String.self) else {
      call.reject("cannot extract the emails value")
      return
    }
    if let enc = call.getBool(AppsFlyerConstants.AF_ENCODE) , enc == true{
      AppsFlyerLib.shared().setUserEmails(emails, with: EmailCryptTypeSHA256)
      
    }else{
      AppsFlyerLib.shared().setUserEmails(emails, with: EmailCryptTypeNone)
      
    }
    call.resolve(["res": "ok"])
    
  }
  
  @objc func logLocation(_ call: CAPPluginCall){
    guard let longitude = call.getDouble(AppsFlyerConstants.AF_LONGITUDE) else {
      call.reject("cannot extract the longitude value")
      return
    }
    guard let latitude = call.getDouble(AppsFlyerConstants.AF_LATITUDE) else {
      call.reject("cannot extract the longitude value")
      return
    }
    
    AppsFlyerLib.shared().logLocation(longitude: longitude, latitude: latitude)
    call.resolve(["res": "ok"])
    
  }
  
  @objc func setPhoneNumber(_ call: CAPPluginCall){
    guard let phone = call.getString(AppsFlyerConstants.AF_PHONE) else {
      call.reject("cannot extract the phone value")
      return
    }
    
    AppsFlyerLib.shared().phoneNumber = phone
    call.resolve(["res": "ok"])
    
  }
  
  @objc func setPartnerData(_ call: CAPPluginCall){
    guard let data = call.getObject(AppsFlyerConstants.AF_DATA) else {
      call.reject("cannot extract the data value")
      return
    }
    guard let pid = call.getString(AppsFlyerConstants.AF_PARTNER_ID) else {
      call.reject("cannot extract the partnerId value")
      return
    }
    
    AppsFlyerLib.shared().setPartnerData(partnerId: pid, partnerInfo: data)
    call.resolve(["res": "ok"])
    
  }
  
  @objc func logInvite(_ call: CAPPluginCall){
    guard let data = call.getObject(AppsFlyerConstants.AF_EVENT_PARAMETERS) else {
      call.reject("cannot extract the eventParameters value")
      return
    }
    guard let channel = call.getString(AppsFlyerConstants.AF_CHANNEL) else {
      call.reject("cannot extract the channel value")
      return
    }
    
    AppsFlyerShareInviteHelper.logInvite(channel, parameters: data)
    call.resolve(["res": "ok"])
    
  }
}

extension AppsFlyerPlugin{
  private func reportBridgeReady(){
    AppsFlyerAttribution.shared.bridgReady = true
    NotificationCenter.default.post(name: Notification.Name.appsflyerBridge, object: nil)
  }
  
  @objc  private func sendLaunch(){
    AppsFlyerLib.shared().start()
  }
  
  @objc func handleUrlOpened(notification: NSNotification) {
    guard let object = notification.object as? [String: Any?] else {
      return
    }
    guard let url =  object["url"] else {
      afLogger(msg: "handleUrlOpened url is nil")
      return
    }
    guard let options =  object["options"] else {
      afLogger(msg: "handleUrlOpened options is nil")
      
      return
    }
    afLogger(msg: "handleUrlOpened with \((url as! URL).absoluteString)")
    AppsFlyerAttribution.shared.handleOpenUrl(open: url as! URL, options: options as! [UIApplication.OpenURLOptionsKey: Any])
    
  }
  
  @objc func handleUniversalLink(notification: NSNotification) {
    guard let object = notification.object as? [String: Any?] else {
      return
    }
    let user = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
    guard let url = object["url"] else {
      afLogger(msg: "handleUrlOpened options is url")
      return
    }
    user.webpageURL = (url as! URL)
    afLogger(msg: "handleUniversalLink with \(user.webpageURL?.absoluteString ?? "null")")
    AppsFlyerAttribution.shared.continueUserActivity(userActivity: user)
    
  }
  
}

extension AppsFlyerPlugin : AppsFlyerLibDelegate {
  public func onConversionDataSuccess(_ conversionInfo: [AnyHashable : Any]) {
    let json : [String: Any] = ["callbackName":"onConversionDataSuccess", "data":conversionInfo]
    self.notifyListeners(AppsFlyerConstants.CONVERSION_CALLBACK, data: json)
    
  }
  
  public func onConversionDataFail(_ error: Error) {
    let json : [String: Any] = ["callbackName":"onConversionDataFail", "status":error.localizedDescription]
    self.notifyListeners(AppsFlyerConstants.CONVERSION_CALLBACK, data: json)
  }
  public func onAppOpenAttribution(_ attributionData: [AnyHashable : Any]) {
    let json : [String: Any] = ["callbackName":"onAppOpenAttribution", "data":attributionData]
    self.notifyListeners(AppsFlyerConstants.OAOA_CALLBACK, data: json)
  }
  
  public func onAppOpenAttributionFailure(_ error: Error) {
    let json : [String: Any] = ["callbackName":"onAppOpenAttributionFailure", "status":error.localizedDescription]
    self.notifyListeners(AppsFlyerConstants.OAOA_CALLBACK, data: json)
    
  }
  
}


// Mark -
extension AppsFlyerPlugin : DeepLinkDelegate{
  public func didResolveDeepLink(_ result: DeepLinkResult) {
    var json : [String: Any] = [:]
    
    switch result.status {
      case .notFound :
        json["status"] = "NOT_FOUND"
      case .failure :
        json["status"] = "FAILURE"
      case .found :
        json["status"] = "FOUND"
    }
    
    if  result.error != nil {
      json["error"] = result.error!.localizedDescription
    }
    if  result.deepLink != nil {
      var deepLinkDic = result.deepLink!.clickEvent
      deepLinkDic["is_deferred"] = result.deepLink!.isDeferred
      json["deepLink"] = deepLinkDic
    }
    self.notifyListeners(AppsFlyerConstants.UDL_CALLBACK, data: json)
  }
  
}

extension AppsFlyerPlugin{
  private func afLogger(msg : String){
    NSLog ("AppsFlyer [Debug][Capacitor]: \(msg)");
  }
}


