package com.johnshammas.reactnativewebviewbridge;

import java.util.Map;

import javax.annotation.Nullable;

import android.webkit.WebChromeClient;
import android.webkit.CookieManager;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.common.annotations.VisibleForTesting;

public class WebViewBridgeManager extends ViewGroupManager<WebViewBridge> {
    public static final String REACT_CLASS = "WebViewAndroid";

    public static final int GO_BACK = 1;
    public static final int GO_FORWARD = 2;
    public static final int RELOAD = 3;
    public static final int INJECT_BRIDGE_SCRIPT = 4;
    public static final int SEND = 5;

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

    @ReactProp(name = "webViewId")
    public void setWebViewId(WebViewBridge view, @Nullable String id) {
        view.setId(id);
    }

    @Override
    public @Nullable Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
            "goBack", GO_BACK,
            "goForward", GO_FORWARD,
            "reload", RELOAD,
            "injectBridgeScript", INJECT_BRIDGE_SCRIPT,
            "send", SEND
        );
    }

    @Override
    public void receiveCommand(WebViewBridge view, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case GO_BACK:
                view.goBack();
                break;
            case GO_FORWARD:
                view.goForward();
                break;
            case RELOAD:
                view.reload();
                break;
            case INJECT_BRIDGE_SCRIPT:
                view.injectBridgeScript();
                break;
            case SEND:
                view.send(args.getString(0));
                break;
        }
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                NavigationStateChangeEvent.EVENT_NAME, MapBuilder.of("registrationName", "onNavigationStateChange")
        );
    }
}
