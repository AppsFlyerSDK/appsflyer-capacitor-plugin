//
//  AppsFlyerAttribution.swift
//  Plugin
//
//  Created by Paz Lavi  on 11/07/2021.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation
import UIKit
import AppsFlyerLib
class AppsFlyerAttribution: NSObject {
    
    static let shared = AppsFlyerAttribution()
    var bridgReady :Bool = false
    private var userActivity :NSUserActivity? = nil
    private var url: URL? = nil
    private var options: [UIApplication.OpenURLOptionsKey: Any]? = nil

    private override init() {
        super.init()
        NotificationCenter.default.addObserver(self, selector: #selector(self.receiveBridgeReadyNotification),
                                               name: Notification.Name.appsflyerBridge, object: nil)
    }
    
    
    
    public func continueUserActivity(userActivity:NSUserActivity) {
        if(bridgReady){
            AppsFlyerLib.shared().continue(userActivity, restorationHandler: nil)
        }else{
            self.userActivity = userActivity
        }
       
    }
    
    public func handleOpenUrl(open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:])  {
        if(bridgReady){
            AppsFlyerLib.shared().handleOpen(url, options:options)
        }else{
            self.url = url
            self.options = options
        }
    }
    
  @objc  func receiveBridgeReadyNotification(){
        NSLog ("AppsFlyer [Debug][Capacitor]: handle deep link");
        if(userActivity != nil){
            AppsFlyerLib.shared().continue(userActivity, restorationHandler: nil)
            userActivity = nil

        }else if(url != nil){
            AppsFlyerLib.shared().handleOpen(url, options:options)
            url = nil
            options = nil
        }
    }

}
