package capacitor.plugin.appsflyer.sdk

import android.Manifest
import android.content.Intent

import com.appsflyer.*
import com.appsflyer.attribution.AppsFlyerRequestListener
import com.appsflyer.deeplink.DeepLinkListener
import com.appsflyer.deeplink.DeepLinkResult
import com.appsflyer.internal.platform_extension.PluginInfo
import com.appsflyer.share.CrossPromotionHelper
import com.appsflyer.share.LinkGenerator
import com.appsflyer.share.ShareInviteHelper
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import org.json.JSONObject


@CapacitorPlugin(
    name = "AppsFlyerPlugin",
    permissions = [Permission(
        strings = arrayOf(
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_NETWORK_STATE,
            "com.google.android.gms.permission.AD_ID"
        )
    )]
)
class AppsFlyerPlugin : Plugin() {
    private var conversion: Boolean? = null
    private var oaoa: Boolean? = null
    private var udl: Boolean? = null


    override fun handleOnNewIntent(intent: Intent?) {
        super.handleOnNewIntent(intent)
        if (intent != null) {
            activity.intent = intent
        }
    }


    @PluginMethod
    fun initSDK(call: PluginCall) {
        val devKey = call.getString(AF_DEV_KEY)
        val debug = call.getBoolean(AF_DEBUG, false)
        val minTime = call.getInt(AF_MIN_TIME)
        val manualStart = call.getBoolean(AF_MANUAL_START, false)
        conversion = call.getBoolean(AF_CONVERSION_LISTENER, true)
        oaoa = call.getBoolean(AF_OAOA, true)
        udl = call.getBoolean(AF_UDL, false)
        val timeout = call.getInt(AF_DEEP_LINK_TIME_OUT)?.toLong()

        AppsFlyerLib.getInstance().apply {
            setPluginInfo(
                PluginInfo(
                    com.appsflyer.internal.platform_extension.Plugin.CAPACITOR,
                    BuildConfig.VERSION_NAME
                    //, mapOf("build_number" to BuildConfig.VERSION_CODE.toString())
                )
            )
            if (debug == true) {
                setDebugLog(true)
            }
            minTime?.let {
                setMinTimeBetweenSessions(it)
            }

            devKey?.let {
                init(
                    devKey,
                    if (conversion == true) getConversionListener() else null,
                    context.applicationContext
                )
            } ?: run {
                call.reject(AF_NULL_DEV_KEY)

            }
            if (udl == true) {
                if (timeout != null) {
                    subscribeForDeepLink(getDeepLinkListener(), timeout)
                } else {
                    subscribeForDeepLink(getDeepLinkListener())
                }
            }

            if (manualStart == false) {
                startSDK(call)
            } else {
                val result = JSObject().apply {
                    put("res", "SDK initiated successfully. SDK has NOT been started yet")
                }
                call.resolve(result)
            }
        }

    }

    @PluginMethod
    fun logEvent(call: PluginCall) {
        val eventName = call.getString(AF_EVENT_NAME)
        val eventValue = AFHelpers.jsonToMap(call.getObject(AF_EVENT_VALUE))
        AppsFlyerLib.getInstance()
            .logEvent(
                activity ?: context.applicationContext,
                eventName,
                eventValue,
                object : AppsFlyerRequestListener {
                    override fun onSuccess() {
                        val ret = JSObject()
                        ret.put("res", "ok")
                        call.resolve(ret)
                    }

                    override fun onError(i: Int, s: String) {
                        call.reject(s, i.toString())
                    }
                })
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setCustomerUserId(call: PluginCall) {
        val cuid = call.getString(AF_CUID)
        if (!cuid.isNullOrEmpty()) {
            AppsFlyerLib.getInstance().setCustomerUserId(cuid)
        } else {
            call.reject("Invalid Customer User ID")
        }

    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setCurrencyCode(call: PluginCall) {
        val code = call.getString(AF_CURRENCY_CODE)
        if (!code.isNullOrEmpty()) {
            AppsFlyerLib.getInstance().setCurrencyCode(code)
        } else {
            call.reject("Invalid Currency Code")
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun updateServerUninstallToken(call: PluginCall) {
        val token = call.getString(AF_TOKEN)
        if (!token.isNullOrEmpty()) {
            AppsFlyerLib.getInstance().updateServerUninstallToken(context, token)
        } else {
            call.reject("Invalid device token")
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setAppInviteOneLink(call: PluginCall) {
        val id = call.getString(AF_ONELINK_ID)
        if (!id.isNullOrEmpty()) {
            AppsFlyerLib.getInstance().setAppInviteOneLink(id)
        } else {
            call.reject("Onelink id is missing")
        }
    }


    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setOneLinkCustomDomain(call: PluginCall) {
        val arr = call.getArray(AF_ONELINK_DOMAIN)
        if (arr != null && arr.length() > 0) {
            val dom = arr.toList<String>().toTypedArray()
            AppsFlyerLib.getInstance().setOneLinkCustomDomain(*dom)
        } else {
            call.reject("Domains are missing")
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun appendParametersToDeepLinkingURL(call: PluginCall) {
        val contains = call.getString(AF_CONTAINS)
        val parameters = AFHelpers.jsonToStringMap(call.getObject(AF_PARAMETERS))
        if (!contains.isNullOrEmpty() && !parameters.isNullOrEmpty()) {
            AppsFlyerLib.getInstance().appendParametersToDeepLinkingURL(contains, parameters)
        }
    }


    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setResolveDeepLinkURLs(call: PluginCall) {
        val arr = call.getArray(AF_DEEPLINK_URLS)
        if (arr != null && arr.length() > 0) {
            val urls = arr.toList<String>().toTypedArray()
            AppsFlyerLib.getInstance().setResolveDeepLinkURLs(*urls)
        } else {
            call.reject("URLs are missing")
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun addPushNotificationDeepLinkPath(call: PluginCall) {
        val arr = call.getArray(AF_PATH)
        if (arr != null && arr.length() > 0) {
            val path = arr.toList<String>().toTypedArray()
            AppsFlyerLib.getInstance().addPushNotificationDeepLinkPath(*path)
        } else {
            call.reject("Path is missing")
        }
    }

    @Deprecated("Use setSharingFilterForPartners")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setSharingFilter(call: PluginCall) {
        val arr = call.getArray(AF_FILTERS)
        if (arr != null && arr.length() > 0) {
            val filters = arr.toList<String>().toTypedArray()
            AppsFlyerLib.getInstance().setSharingFilter(*filters)
        } else {
            AppsFlyerLib.getInstance().setSharingFilter("")
        }
    }

    @Deprecated("Use setSharingFilterForPartners")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setSharingFilterForAllPartners(call: PluginCall) {
        AppsFlyerLib.getInstance().setSharingFilterForAllPartners()
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setSharingFilterForPartners(call: PluginCall) {
        val filters = call.getArray(AF_FILTERS)?.run {
            toList<String>().toTypedArray()
        } ?: return call.reject("cannot extract the filters value")
        AppsFlyerLib.getInstance().setSharingFilterForPartners(*filters)

    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setAdditionalData(call: PluginCall) {
        val data = call.getObject(AF_ADDITIONAL_DATA)
        if (data != null) {
            AppsFlyerLib.getInstance().setAdditionalData(AFHelpers.jsonToMap(data))
        } else {
            call.reject("Data is missing")
        }
    }

    @PluginMethod
    fun getAppsFlyerUID(call: PluginCall) {
        val id = AppsFlyerLib.getInstance().getAppsFlyerUID(context)
        val obj = JSObject().apply {
            put(AF_UID, id)
        }
        call.resolve(obj)
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun anonymizeUser(call: PluginCall) {
        call.getBoolean(AF_ANONYMIZE_USER)?.let {
            AppsFlyerLib.getInstance().anonymizeUser(it)
        } ?: run { call.reject("Missing boolean value anonymizeUser") }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setDisableNetworkData(call: PluginCall) {
        call.getBoolean(AF_DISABLE)?.let {
            AppsFlyerLib.getInstance().setDisableNetworkData(it)
        } ?: run { call.reject("Missing boolean value disable") }
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        val shouldStop = call.getBoolean(AF_STOP)
        AppsFlyerLib.getInstance().apply {
            if (shouldStop != null) {
                stop(shouldStop, context)
            }
            val obj = JSObject().apply {
                put(AF_IS_STOP, isStopped)
            }
            call.resolve(obj)

        }
    }

    @PluginMethod
    fun startSDK(call: PluginCall) {
        AppsFlyerLib.getInstance()
            .start(activity ?: context.applicationContext, null, object : AppsFlyerRequestListener {
                override fun onSuccess() {
                    val result = JSObject().apply {
                        put("res", "success")
                    }
                    call.resolve(result)
                }

                override fun onError(errCode: Int, msg: String) {
                    call.reject("Error Code: $errCode, Message: $msg")
                }
            })
    }

    @PluginMethod
    fun disableSKAdNetwork(call: PluginCall) {
        call.unavailable()
    }


    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun disableAdvertisingIdentifier(call: PluginCall) {
        call.getBoolean(AF_DISABLE_SKAD)?.let {
            AppsFlyerLib.getInstance().setDisableAdvertisingIdentifiers(it)
        } ?: run { call.reject("Missing boolean value shouldDisable") }
    }

    @PluginMethod
    fun disableCollectASA(call: PluginCall) {
        call.unavailable()
    }


    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setHost(call: PluginCall) {
        val pre = call.getString(AF_HOST_PREFIX)
        val post = call.getString(AF_HOST_NAME)
        if (pre != null && post != null) {
            AppsFlyerLib.getInstance().setHost(pre, post)
        } else {
            call.reject("Missing host prefix and/or host name")
        }
    }

    @PluginMethod
    fun generateInviteLink(call: PluginCall) {

        val linkGenerator = ShareInviteHelper.generateInviteUrl(context).apply {
            brandDomain = call.getString(AF_BRAND_DOMAIN)
            campaign = call.getString(AF_CAMPAIGN)
            channel = call.getString(AF_CHANNEL)
            setReferrerName(call.getString(AF_REFERRER_NAME))
            setReferrerImageURL(call.getString(AF_REFERRER_IMAGE_URL))
            setReferrerCustomerId(call.getString(AF_REFERRER_CUSTOMER_ID))
            setBaseDeeplink(call.getString(AF_BASE_DEEPLINK))
            addParameters(AFHelpers.jsonToStringMap(call.getObject(AF_ADD_PARAMETERS)))

        }

        val listener = object : LinkGenerator.ResponseListener {
            override fun onResponse(s: String?) {
                val obj = JSObject().apply {
                    put(AF_LINK_READY, s)
                }
                call.resolve(obj)
            }

            override fun onResponseError(s: String?) {
                call.reject(s)
            }
        }

        linkGenerator.generateLink(context, listener)
    }

    @PluginMethod
    fun validateAndLogInAppPurchaseAndroid(call: PluginCall) {
        val currency = call.getString(AF_CURRENCY)
        val publicKey = call.getString(AF_PUBLIC_KEY)
        val signature = call.getString(AF_SIGNATURE)
        val purchaseData = call.getString(AF_PURCHASE_DATA)
        val price = call.getString(AF_PRICE)
        val additionalParameters =
            AFHelpers.jsonToStringMap(call.getObject(AF_ADDITIONAL_PARAMETERS))
        if (currency != null && publicKey != null && signature != null && purchaseData != null) {
            AppsFlyerLib.getInstance().apply {
                registerValidatorListener(context,
                    object : AppsFlyerInAppPurchaseValidatorListener {
                        override fun onValidateInApp() {
                            val ret = JSObject()
                            ret.put("res", "ok")
                            call.resolve(ret)
                        }

                        override fun onValidateInAppFailure(p0: String?) {
                            call.reject(p0)
                        }
                    })

                validateAndLogInAppPurchase(
                    context,
                    publicKey,
                    signature,
                    purchaseData,
                    price,
                    currency,
                    additionalParameters
                )
            }
        } else {
            call.reject("Missing some fields")
        }

        @PluginMethod
        fun validateAndLogInAppPurchaseIos(call: PluginCall) {
            call.unavailable()
        }
    }

    @PluginMethod
    fun getSdkVersion(call: PluginCall) {
        val v = AppsFlyerLib.getInstance().sdkVersion
        val obj = JSObject().apply {
            put("res", v)
        }
        call.resolve(obj)
    }

    @PluginMethod
    fun enableFacebookDeferredApplinks(call: PluginCall) {
        val b = call.getBoolean(AF_FB)
        if (b != null) {
            AppsFlyerLib.getInstance().enableFacebookDeferredApplinks(b)
            val obj = JSObject().apply {
                val m = (if (b) "enabled" else "disabled")
                put("res", m)
            }
            call.resolve(obj)
        } else {
            call.reject("missing boolean value $AF_FB")
        }
    }

    @PluginMethod
    fun sendPushNotificationData(call: PluginCall) {
        val json = call.getObject(AF_PUSH_PAYLOAD)
        val i = activity.intent
        AFHelpers.jsonToBundle(json)?.run {
            i.putExtras(this)
        }
        activity.intent = i
        AppsFlyerLib.getInstance().sendPushNotificationData(activity)

    }

    @PluginMethod
    fun logCrossPromoteImpression(call: PluginCall) {
        val appID =
            call.getString(AF_APP_ID) ?: return call.reject("cannot extract the appID value")
        val campaign =
            call.getString(AF_CAMPAIGN) ?: return call.reject("cannot extract the campaign value")
        val parameters = AFHelpers.jsonToStringMap(call.getObject(AF_PARAMETERS))
            ?: return call.reject("cannot extract the parameters value")

        CrossPromotionHelper.logCrossPromoteImpression(
            context.applicationContext,
            appID,
            campaign,
            parameters
        )
        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod
    fun setUserEmails(call: PluginCall) {
        val emails = call.getArray(AF_EMAILS)?.run {
            toList<String>().toTypedArray()
        } ?: return call.reject("cannot extract the emails value")

        val enc = call.getBoolean(AF_ENCODE)

        if (enc != true) {
            AppsFlyerLib.getInstance().setUserEmails(*emails)
        } else {
            AppsFlyerLib.getInstance()
                .setUserEmails(AppsFlyerProperties.EmailsCryptType.SHA256, *emails)
        }

        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod
    fun logLocation(call: PluginCall) {
        val longitude =
            call.getDouble(AF_LONGITUDE) ?: return call.reject("cannot extract the longitude value")
        val latitude =
            call.getDouble(AF_LATITUDE) ?: return call.reject("cannot extract the latitude value")
        AppsFlyerLib.getInstance().logLocation(context.applicationContext, latitude, longitude)
        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod
    fun setPhoneNumber(call: PluginCall) {
        val phone = call.getString(AF_PHONE) ?: return call.reject("cannot extract the phone value")
        AppsFlyerLib.getInstance().setPhoneNumber(phone)
        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod
    fun setPartnerData(call: PluginCall) {
        val data = AFHelpers.jsonToMap(call.getObject(AF_DATA))
            ?: return call.reject("cannot extract the data value")
        val pid = call.getString(AF_PARTNER_ID)
            ?: return call.reject("cannot extract the partnerId value")

        AppsFlyerLib.getInstance().setPartnerData(pid, data)
        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod
    fun logInvite(call: PluginCall) {
        val data = AFHelpers.jsonToStringMap(call.getObject(AF_EVENT_PARAMETERS))
            ?: return call.reject("cannot extract the eventParameters value")
        val channel =
            call.getString(AF_CHANNEL) ?: return call.reject("cannot extract the channel value")
        ShareInviteHelper.logInvite(activity.application, channel, data)
        val ret = JSObject()
        ret.put("res", "ok")
        call.resolve(ret)

    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun enableTCFDataCollection(call: PluginCall) {
        val shouldEnable = call.getBoolean(AF_ENABLE_TCF_DATA_COLLECTION)
        if (shouldEnable != null) {
            AppsFlyerLib.getInstance().enableTCFDataCollection(shouldEnable)
        } else {
            call.reject("Missing boolean value $AF_ENABLE_TCF_DATA_COLLECTION")
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setConsentData(call: PluginCall) {
        val consentData = call.getObject("data") ?: return call.reject("Missing consent data")

        val isUserSubjectToGDPR = consentData.optBoolean(AF_IS_SUBJECTED_TO_GDPR)
        val hasConsentForDataUsage = consentData.optBoolean(AF_CONSENT_FOR_DATA_USAGE)
        val hasConsentForAdsPersonalization = consentData.optBoolean(AF_CONSENT_FOR_ADS_PERSONALIZATION)

        val consentObject = if (isUserSubjectToGDPR) {
            AppsFlyerConsent.forGDPRUser(hasConsentForDataUsage, hasConsentForAdsPersonalization)
        } else {
            AppsFlyerConsent.forNonGDPRUser()
        }

        AppsFlyerLib.getInstance().setConsentData(consentObject)

        call.resolve()
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun logAdRevenue(call: PluginCall) {
        val adRevenueDataJson = call.data ?: return call.reject("adRevenueData is missing, the data mandatory to use this API.")

        // Parse the fields from the adRevenueDataJson object
        val monetizationNetwork = adRevenueDataJson.getString(AF_MONETIZATION_NETWORK) ?: return call.reject("monetizationNetwork is missing")
        val currencyIso4217Code = adRevenueDataJson.getString(AF_CURRENCY_ISO4217_CODE) ?: return call.reject("currencyIso4217Code is missing")
        val revenue = adRevenueDataJson.getDouble(AF_REVENUE)
        if (revenue.isNaN()) {
            return call.reject("revenue is missing or not a number")
        }
        val additionalParams = AFHelpers.jsonToMap(adRevenueDataJson.getJSObject(AF_ADDITIONAL_PARAMETERS)) // can be nullable

        // Convert the mediationNetwork string to the MediationNetwork enum
        val mediationNetworkValue = adRevenueDataJson.getString(AF_MEDIATION_NETWORK) ?: return call.reject("mediationNetwork is missing")
        val mediationNetwork: MediationNetwork
        try {
            mediationNetwork = MediationNetwork.valueOf(mediationNetworkValue.uppercase())
        } catch (e: IllegalArgumentException) {
            return call.reject("Invalid mediation network")
        }

        // Create the AFAdRevenueData object
        val adRevenueData = AFAdRevenueData(
            monetizationNetwork = monetizationNetwork,
            mediationNetwork = mediationNetwork,
            currencyIso4217Code = currencyIso4217Code,
            revenue = revenue
        )

        AppsFlyerLib.getInstance().logAdRevenue(adRevenueData, additionalParams)

        call.resolve()
    }

    private fun getDeepLinkListener(): DeepLinkListener {
        return DeepLinkListener {
            if (udl == true) {

                val res = JSObject().apply {
                    put("status", it.status)
                    put("error", it.error)
                    if (it.status == DeepLinkResult.Status.FOUND && it.deepLink != null)
                        put(
                            "deepLink",
                            JSObject.fromJSONObject(JSONObject(it.deepLink.toString()))
                        )
                }

                notifyListeners(UDL_CALLBACK, res)
            }
        }
    }

    private fun getConversionListener(): AppsFlyerConversionListener {
        return object : AppsFlyerConversionListener {
            override fun onConversionDataSuccess(map: MutableMap<String, Any>?) {
                if (conversion != true)
                    return

                val res = JSObject().apply {
                    put("callbackName", "onConversionDataSuccess")
                    put("data", AFHelpers.mapToJson(map))
                }
                notifyListeners(CONVERSION_CALLBACK, res)
            }

            override fun onConversionDataFail(s: String?) {
                if (conversion != true)
                    return

                val res = JSObject().apply {
                    put("callbackName", "onConversionDataFail")
                    put("error", s)

                }
                notifyListeners(CONVERSION_CALLBACK, res)
            }

            override fun onAppOpenAttribution(map: MutableMap<String, String>?) {
                if (oaoa != true)
                    return

                val res = JSObject().apply {
                    put("callbackName", "onAppOpenAttribution")
                    put("data", AFHelpers.mapToJson(map))
                }
                notifyListeners(OAOA_CALLBACK, res)
            }

            override fun onAttributionFailure(s: String?) {
                if (oaoa != true)
                    return
                val res = JSObject().apply {
                    put("callbackName", "onAttributionFailure")
                    put("error", s)

                }
                notifyListeners(OAOA_CALLBACK, res)
            }
        }
    }
}
