package com.johnshammas.reactnativewebviewbridge;

import java.util.Map;

import javax.annotation.Nullable;

import android.webkit.WebChromeClient;
import android.webkit.CookieManager;

import com.facebook.react.common.annotations.VisibleForTesting;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ReactProp;

public class WebViewBridgeManager extends ViewGroupManager<WebViewBridge> {
    public static final String REACT_CLASS = "WebViewAndroid";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebViewBridge createViewInstance(ThemedReactContext context) {
        CookieManager.getInstance().setAcceptCookie(true); // add default cookie support
        CookieManager.getInstance().setAcceptFileSchemeCookies(true); // add default cookie support

        return new WebViewBridge(context);
    }

    @ReactProp(name = "disableCookies", defaultBoolean = false)
    public void setDisableCookies(WebViewBridge view, boolean disableCookies) {
        if(disableCookies) {
            CookieManager.getInstance().setAcceptCookie(false);
            CookieManager.getInstance().setAcceptFileSchemeCookies(false);
        } else {
            CookieManager.getInstance().setAcceptCookie(true);
            CookieManager.getInstance().setAcceptFileSchemeCookies(true);
        }
    }

    @ReactProp(name = "builtInZoomControls", defaultBoolean = false)
    public void setBuiltInZoomControls(WebViewBridge view, boolean builtInZoomControls) {
        view.getSettings().setBuiltInZoomControls(builtInZoomControls);
    }

    @ReactProp(name = "geolocationEnabled", defaultBoolean = false)
    public void setGeolocationEnabled(WebViewBridge view, boolean geolocationEnabled) {
        view.getSettings().setGeolocationEnabled(geolocationEnabled);

        if(geolocationEnabled) {
            view.setWebChromeClient(view.getGeoClient());
        }
        else {
            view.setWebChromeClient(new WebChromeClient());
        }
    }

    @ReactProp(name = "javaScriptEnabled", defaultBoolean = true)
    public void setJavaScriptEnabled(WebViewBridge view, boolean javaScriptEnabled) {
        view.getSettings().setJavaScriptEnabled(javaScriptEnabled);
    }

    @ReactProp(name = "url")
    public void setUrl(WebViewBridge view, @Nullable String url) {
        view.loadUrl(url);
    }

    @ReactProp(name = "htmlCharset")
    public void setHtmlCharset(WebViewBridge view, @Nullable String htmlCharset) {
        if(htmlCharset != null) view.setCharset(htmlCharset);
    }

    @ReactProp(name = "html")
    public void setHtml(WebViewBridge view, @Nullable String html) {
        view.loadData(html, "text/html", view.getCharset());
    }

    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebViewBridge view, @Nullable String injectedJavaScript) {
        view.setInjectedJavaScript(injectedJavaScript);
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                NavigationStateChangeEvent.EVENT_NAME, MapBuilder.of("registrationName", "onNavigationStateChange")
        );
    }
}
