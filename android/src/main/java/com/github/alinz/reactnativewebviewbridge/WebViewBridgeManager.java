package com.github.alinz.reactnativewebviewbridge;

import android.webkit.WebView;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import android.text.TextUtils;
import android.graphics.Bitmap;

import java.util.Map;

import javax.annotation.Nullable;
import android.webkit.WebChromeClient;
import android.view.ViewGroup.LayoutParams;
import com.facebook.react.common.build.ReactBuildConfig;
import android.os.Build;
import android.webkit.GeolocationPermissions;
import com.facebook.react.views.webview.WebViewConfig;
import android.webkit.ValueCallback;

public class WebViewBridgeManager extends ReactWebViewManager {
    private static final String REACT_CLASS = "RCTWebViewBridge";
    private static final String HTML_ENCODING = "UTF-8";
    private static final String HTML_MIME_TYPE = "text/html; charset=utf-8";

    private static final String HTTP_METHOD_POST = "POST";

    public static final int COMMAND_SEND_TO_BRIDGE = 101;

    private static final String BLANK_URL = "about:blank";

    private WebViewConfig mWebViewConfig;

    public WebViewBridgeManager() {
        mWebViewConfig = new WebViewConfig() {
            public void configWebView(WebView webView) {
            }
        };
    }

    public WebViewBridgeManager(WebViewConfig webViewConfig) {
        mWebViewConfig = webViewConfig;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public
    @Nullable
    Map<String, Integer> getCommandsMap() {
        Map<String, Integer> commandsMap = super.getCommandsMap();

        commandsMap.put("sendToBridge", COMMAND_SEND_TO_BRIDGE);

        return commandsMap;
    }

    protected static class ReactWebChromeClient extends WebChromeClient {

        private boolean was = false;
        private int last = 100;

        public void onProgressChanged(WebView view, int newProgress) {
            if (newProgress < 70) {
                if(was == false || last < newProgress){
                    was = true;
                    last = newProgress;
                    ((ReactWebView) view).callInjectedOnStartLoadingJavaScript();
                }
            } else {
                was = false;
                last = 100;
            }
        }

    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        ReactWebView webView = new ReactWebView(reactContext);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });
        reactContext.addLifecycleEventListener(webView);
        mWebViewConfig.configWebView(webView);
        webView.getSettings().setBuiltInZoomControls(true);
        webView.getSettings().setDisplayZoomControls(false);

        // Fixes broken full-screen modals/galleries due to body height being 0.
        webView.setLayoutParams(
                new LayoutParams(LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT));

        if (ReactBuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView.setWebChromeClient(new ReactWebChromeClient());

        return webView;
    }

    @Override
    public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);

        switch (commandId) {
            case COMMAND_SEND_TO_BRIDGE:
                sendToBridge(root, args.getString(0));
                break;
            default:
                //do nothing!!!!
        }
    }

    private void sendToBridge(WebView root, String message) {
        String script = "WebViewBridge.onMessage('" + message + "');";
        WebViewBridgeManager.evaluateJavascript(root, script);
    }

    static private void evaluateJavascript(WebView root, String javascript) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            root.evaluateJavascript(javascript, null);
        } else {
            root.loadUrl("javascript:" + javascript);
        }
    }

    @ReactProp(name = "allowFileAccessFromFileURLs")
    public void setAllowFileAccessFromFileURLs(WebView root, boolean allows) {
        root.getSettings().setAllowFileAccessFromFileURLs(allows);
    }

    @ReactProp(name = "allowUniversalAccessFromFileURLs")
    public void setAllowUniversalAccessFromFileURLs(WebView root, boolean allows) {
        root.getSettings().setAllowUniversalAccessFromFileURLs(allows);
    }

    @ReactProp(name = "injectedOnStartLoadingJavaScript")
    public void setInjectedOnStartLoadingJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((ReactWebView) view).setInjectedOnStartLoadingJavaScript(injectedJavaScript);
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, WebView view) {
        // Do not register default touch emitter and let WebView implementation handle touches
        view.setWebViewClient(new ReactWebViewClient());
    }

    protected static class ReactWebView extends ReactWebViewManager.ReactWebView {
        private @Nullable String injectedOnStartLoadingJS;

        public void setInjectedOnStartLoadingJavaScript(@Nullable String js) {
            injectedOnStartLoadingJS = js;
        }

        public ReactWebView(ThemedReactContext reactContext) {
            super(reactContext);
        }

        public void callInjectedOnStartLoadingJavaScript() {
            if (injectedOnStartLoadingJS != null &&
                    !TextUtils.isEmpty(injectedOnStartLoadingJS)) {
                evaluateJavascript(injectedOnStartLoadingJS, new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {

                            }
                        }
                );
            }
        }
    }

    protected static class ReactWebViewClient extends ReactWebViewManager.ReactWebViewClient {
        @Override
        public void onPageStarted(WebView webView, String url, Bitmap favicon) {
            ReactWebView reactWebView = (ReactWebView) webView;
            reactWebView.callInjectedOnStartLoadingJavaScript();
            super.onPageStarted(webView, url, favicon);
        }
    }

}
