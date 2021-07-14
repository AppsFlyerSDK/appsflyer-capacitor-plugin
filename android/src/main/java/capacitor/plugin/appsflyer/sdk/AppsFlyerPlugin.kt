package capacitor.plugin.appsflyer.sdk

import android.Manifest
import android.content.Intent
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ADDITIONAL_DATA
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ADDITIONAL_PARAMETERS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ADD_PARAMETERS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ANONYMIZE_USER
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_BASE_DEEPLINK
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_BRAND_DOMAIN
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CAMPAIGN
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CHANNEL
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CONTAINS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CONVERSION_LISTENER
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CUID
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CURRENCY
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_CURRENCY_CODE
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_DEBUG
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_DEEPLINK_URLS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_DEV_KEY
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_DISABLE_SKAD
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_EVENT_NAME
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_EVENT_VALUE
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_FB
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_FILTERS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_HOST_NAME
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_HOST_PREFIX
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_IS_STOP
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_LINK_READY
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_MIN_TIME
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_OAOA
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ONELINK_DOMAIN
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_ONELINK_ID
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PARAMETERS
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PATH
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PRICE
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PUBLIC_KEY
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PURCHASE_DATA
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_PUSH_PAYLOAD
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_REFERRER_CUSTOMER_ID
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_REFERRER_IMAGE_URL
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_REFERRER_NAME
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_SIGNATURE
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_STOP
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_TOKEN
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_UDL
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.AF_UID
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.CONVERSION_CALLBACK
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.OAOA_CALLBACK
import capacitor.plugin.appsflyer.sdk.AppsFlyerConstants.UDL_CALLBACK
import com.appsflyer.AppsFlyerConversionListener
import com.appsflyer.AppsFlyerInAppPurchaseValidatorListener
import com.appsflyer.AppsFlyerLib
import com.appsflyer.CreateOneLinkHttpTask
import com.appsflyer.attribution.AppsFlyerRequestListener
import com.appsflyer.deeplink.DeepLinkListener
import com.appsflyer.deeplink.DeepLinkResult
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
            Manifest.permission.ACCESS_WIFI_STATE
        ))]
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
        conversion = call.getBoolean(AF_CONVERSION_LISTENER, true)
        oaoa = call.getBoolean(AF_OAOA, true)
        udl = call.getBoolean(AF_UDL, false)

        AppsFlyerLib.getInstance().apply {
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
                    activity.applicationContext
                )
            }
            if (udl == true) {
                subscribeForDeepLink(getDeepLinkListener())
            }
            start(activity, null, object : AppsFlyerRequestListener {
                override fun onSuccess() {
                    val ret = JSObject()
                    ret.put("res", "ok")
                    call.resolve(ret)
                }

                override fun onError(p0: Int, p1: String) {
                    call.reject(p1, p0.toString())
                }

            })
        }

    }

    @PluginMethod
    fun logEvent(call: PluginCall) {
        val eventName = call.getString(AF_EVENT_NAME)
        val eventValue = AFHelpers.jsonToMap(call.getObject(AF_EVENT_VALUE))
        AppsFlyerLib.getInstance()
            .logEvent(activity, eventName, eventValue, object : AppsFlyerRequestListener {
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

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun setSharingFilterForAllPartners(call: PluginCall) {
        AppsFlyerLib.getInstance().setSharingFilterForAllPartners()
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

    @PluginMethod()
    fun getAppsFlyerUID(call: PluginCall) {
        val id = AppsFlyerLib.getInstance().getAppsFlyerUID(context)
        val obj = JSObject().apply {
            put(AF_UID, id)
        }
        call.resolve(obj)
    }

    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun anonymizeUser(call: PluginCall) {
        val anonymizeUser = call.getBoolean(AF_ANONYMIZE_USER)
        if (anonymizeUser == null) {
            call.reject("Missing boolean value anonymizeUser")
        }
        AppsFlyerLib.getInstance().anonymizeUser(anonymizeUser!!)

    }

    @PluginMethod()
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

    @PluginMethod()
    fun disableSKAdNetwork(call: PluginCall) {
        call.unavailable()
    }


    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun disableAdvertisingIdentifier(call: PluginCall) {
        val disable = call.getBoolean(AF_DISABLE_SKAD)
        if (disable != null) {
            AppsFlyerLib.getInstance().setDisableAdvertisingIdentifiers(disable)
        } else {
            call.reject("Missing boolean value shouldDisable")

        }
    }

    @PluginMethod()
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

    @PluginMethod()
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

        val listener = object : CreateOneLinkHttpTask.ResponseListener {
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

    @PluginMethod()
    fun getSdkVersion(call: PluginCall) {
        val v = AppsFlyerLib.getInstance().sdkVersion
        val obj = JSObject().apply {
            put("res", v)
        }
        call.resolve(obj)
    }

    @PluginMethod()
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

    @PluginMethod()
    fun sendPushNotificationData(call: PluginCall) {
        val json = call.getObject(AF_PUSH_PAYLOAD)
        val i = activity.intent
        AFHelpers.jsonToBundle(json)?.run {
            i.putExtras(this)
        }
        activity.intent = i
        AppsFlyerLib.getInstance().sendPushNotificationData(activity)

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


