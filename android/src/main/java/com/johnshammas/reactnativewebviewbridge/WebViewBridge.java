package com.johnshammas.reactnativewebviewbridge;

import android.os.SystemClock;
import android.util.Log;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;

public class WebViewBridge extends WebView {

    protected class GeoWebChromeClient extends WebChromeClient {
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            callback.invoke(origin, true, false);
        }
    }

    protected class EventWebClient extends WebViewClient {

        private String injectedJavaScript = null;

        public void setInjectedJavaScript(String injectedJavaScript) {
            this.injectedJavaScript = injectedJavaScript;
        }

        public String getInjectedJavaScript() {
            return this.injectedJavaScript;
        }

        public void onPageFinished(WebView view, String url) {
            mEventDispatcher.dispatchEvent(
                    new NavigationStateChangeEvent(getId(), SystemClock.uptimeMillis(), false, url, view.canGoBack(), view.canGoForward()));

            if(getInjectedJavaScript() != null) {
                view.loadUrl("javascript:(function() { " + getInjectedJavaScript() + "})()");
            }
        }

        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            mEventDispatcher.dispatchEvent(
                    new NavigationStateChangeEvent(getId(), SystemClock.uptimeMillis(), true, url, view.canGoBack(), view.canGoForward()));
        }
    }

    private final EventDispatcher mEventDispatcher;
    private final EventWebClient mWebViewClient;
    private String charset = "UTF-8";

    public WebViewBridge(ReactContext reactContext) {
        super(reactContext);

        mEventDispatcher = reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        mWebViewClient = new EventWebClient();

        this.getSettings().setJavaScriptEnabled(true);
        this.getSettings().setBuiltInZoomControls(false);
        this.getSettings().setGeolocationEnabled(false);
        this.getSettings().setAllowFileAccess(true);
        this.getSettings().setAllowFileAccessFromFileURLs(true);
        this.getSettings().setAllowUniversalAccessFromFileURLs(true);
        this.getSettings().setLoadsImagesAutomatically(true);
        this.getSettings().setBlockNetworkImage(false);
        this.getSettings().setBlockNetworkLoads(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            this.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        this.setWebViewClient(mWebViewClient);
        this.setWebChromeClient(new WebChromeClient());
    }

    public void setCharset(String charset) {
        this.charset = charset;
    }

    public String getCharset() {
        return this.charset;
    }

    public void setInjectedJavaScript(String injectedJavaScript) {
        mWebViewClient.setInjectedJavaScript(injectedJavaScript);
    }

    public String getInjectedJavaScript() {
        return mWebViewClient.getInjectedJavaScript();
    }

    public GeoWebChromeClient getGeoClient() {
        return new GeoWebChromeClient();
    }

    protected class JavascriptBridge {
        public void send(String message) {

        }
    }

    public void injectBridgeScript() {
        this.addJavascriptInterface(new JavascriptBridge(), "WebViewBridgeAndroid");
        this.reload();

        this.evaluateJavascript(""
+ "(function() {"
    + "var customEvent = document.createEvent('Event');"
    + "WebViewBridge = {"
        + "send: function(message) { WebViewBridgeAndroid.send(message); },"
        + "onMessage: function() {}"
    + "};"
    + "window.WebViewBridge = WebViewBridge;"
    + "customEvent.initEvent('WebViewBridge', true, true);"
    + "document.dispatchEvent(customEvent);"
+"}())", null);

    }

    public void send(String message) {
        this.evaluateJavascript("WebViewBridge.onMessage('" + message + "');", null);
    }

}
