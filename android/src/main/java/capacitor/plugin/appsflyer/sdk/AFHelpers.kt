package capacitor.plugin.appsflyer.sdk

import android.os.Bundle
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import org.json.JSONException
import java.util.HashMap

object AFHelpers {

    fun jsonToMap(json: JSObject?): Map<String, Any>? {
        var newMap: MutableMap<String, Any>? = null
        json?.run {
             newMap = HashMap()
                val iterator: Iterator<*> = keys()
                while (iterator.hasNext()) {
                    val key = iterator.next() as String
                    newMap!![key] = get(key)
                }
            }
        return newMap
    }


    fun jsonToStringMap(json: JSObject?): Map<String, String>? {
        var newMap: MutableMap<String, String>? = null
        json?.run {
             newMap = HashMap()
            try {
                val iterator: Iterator<*> = keys()
                while (iterator.hasNext()) {
                    val key = iterator.next() as String
                    newMap!![key] = get(key) as String
                }
            } catch (e: JSONException) {
                afLogger(e.message)
                return null
            }


        }
        return newMap
    }

    fun jsonToBundle(json: JSObject?): Bundle? {
        val bundle = Bundle()
      json?.run {
                val iterator: Iterator<*> = keys()
                while (iterator.hasNext()) {
                    val key = iterator.next() as String
                    val value =get(key) as String
                    bundle.putString(key,value )
                }
            }
        return bundle
    }


    fun mapToJson(map: Map<String, Any>?): JSObject? {
        map?.run {
            val json = JSObject()
            for ((k, v) in map) {
                json.put(k, v)
            }
            return json

        }
        return null
    }

    private fun afLogger(message: String?) {
        if (!message.isNullOrEmpty())
            Log.d(TAG, message)
    }


}