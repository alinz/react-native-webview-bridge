package com.github.alinz.reactnativewebviewbridge;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils;
import android.util.Log;
import android.view.ViewGroup.LayoutParams;
import android.webkit.*;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.*;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.views.webview.WebViewConfig;
import com.facebook.react.views.webview.events.TopLoadingErrorEvent;
import com.facebook.react.views.webview.events.TopLoadingFinishEvent;
import com.facebook.react.views.webview.events.TopLoadingStartEvent;
import com.facebook.react.views.webview.events.TopMessageEvent;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.OkHttpClient.Builder;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONException;
import org.json.JSONObject;

import javax.annotation.Nullable;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Map;

import static okhttp3.internal.Util.UTF_8;

public class WebViewBridgeManager extends ReactWebViewManager {
    private static final String REACT_CLASS = "RCTWebViewBridge";
    private static final String BRIDGE_NAME = "__REACT_WEB_VIEW_BRIDGE";


    private static final int COMMAND_SEND_TO_BRIDGE = 101;
    public static final int GEO_PERMISSIONS_GRANTED = 103;

    private static final String TAG = "WebViewBridgeManager";

    private WebViewConfig mWebViewConfig;
    private static ReactApplicationContext reactNativeContext;
    private OkHttpClient client;
    private static boolean debug;

    public WebViewBridgeManager(ReactApplicationContext context, boolean debug) {
        this.reactNativeContext = context;
        this.debug = debug;
        Builder b = new Builder();
        client = b
                .followRedirects(false)
                .followSslRedirects(false)
                .build();
        mWebViewConfig = new WebViewConfig() {
            public void configWebView(WebView webView) {
            }
        };
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public @Nullable
    Map<String, Integer> getCommandsMap() {
        Map<String, Integer> commandsMap = super.getCommandsMap();

        commandsMap.put("sendToBridge", COMMAND_SEND_TO_BRIDGE);
        commandsMap.put("geoPermissionsGranted", GEO_PERMISSIONS_GRANTED);

        return commandsMap;
    }

    protected static class ReactWebChromeClient extends WebChromeClient {

        String origin;
        GeolocationPermissions.Callback callback;

        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            try {
                WritableMap params = Arguments.createMap();
                JSONObject event = new JSONObject();
                event.put("type", "request_geo_permissions");
                params.putString("jsonEvent", event.toString());
                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("gethEvent", params);
                this.callback = callback;
                this.origin = origin;
            } catch (JSONException e) {

            }
        }

        public void geoCallback() {
            if (callback != null) {
                callback.invoke(origin, true, false);
            }
        }
    }

    static String userAgent = "";

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        ReactWebView webView = new ReactWebView(reactContext);
        userAgent = webView.getSettings().getUserAgentString();
        reactContext.addLifecycleEventListener(webView);
        mWebViewConfig.configWebView(webView);
        webView.getSettings().setBuiltInZoomControls(true);
        webView.getSettings().setDisplayZoomControls(false);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setGeolocationEnabled(true);
        webView.setInitialScale(1);

        // Fixes broken full-screen modals/galleries due to body height being 0.
        webView.setLayoutParams(
                new LayoutParams(LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT));

        if (debug && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        ReactWebChromeClient client = new ReactWebChromeClient();
        webView.setWebChromeClient(client);
        webView.setWebViewClient(new ReactWebViewClient());
        webView.addJavascriptInterface(new JavascriptBridge(webView), "WebViewBridge");
        StatusBridge bridge = new StatusBridge(reactContext, webView);
        webView.addJavascriptInterface(bridge, "StatusBridge");
        webView.setStatusBridge(bridge);

        return webView;
    }

    @Override
    public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);

        switch (commandId) {
            case COMMAND_SEND_TO_BRIDGE:
                sendToBridge(root, args.getString(0));
                break;
            case GEO_PERMISSIONS_GRANTED:
                ((ReactWebChromeClient) ((ReactWebView) root).getWebChromeClient()).geoCallback();
                break;
            default:
                //do nothing!!!!
        }
    }

    private void sendToBridge(WebView root, String message) {
        String script = "WebViewBridge.onMessage('" + message + "');";
        WebViewBridgeManager.evaluateJavascript(root, script, null);
    }

    static private void evaluateJavascript(WebView root, String javascript, ValueCallback<String> callback) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            root.evaluateJavascript(javascript, callback);
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

    @Override
    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((ReactWebView) view).setInjectedJavaScript(injectedJavaScript);
    }

    @Override
    @ReactProp(name = "messagingEnabled")
    public void setMessagingEnabled(WebView view, boolean enabled) {
        ((ReactWebView) view).setMessagingEnabled(enabled);
    }

    @ReactProp(name = "injectedOnStartLoadingJavaScript")
    public void setInjectedOnStartLoadingJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((ReactWebView) view).setInjectedOnStartLoadingJavaScript(injectedJavaScript);
    }

    @ReactProp(name = "localStorageEnabled")
    public void setLocalStorageEnabled(WebView view, boolean enabled) {
        if (enabled) {
            view.getSettings().setDomStorageEnabled(true);
            view.getSettings().setDatabaseEnabled(true);
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
                view.getSettings().setDatabasePath("/data/data/" + view.getContext().getPackageName() + "/databases/");
            }
        }
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, WebView view) {

    }

    private static class ReactWebView extends WebView implements LifecycleEventListener {
        private @Nullable
        String injectedJS;
        private @Nullable
        String injectedOnStartLoadingJS;
        private StatusBridge bridge;
        private boolean messagingEnabled = false;

        private class ReactWebViewBridge {
            ReactWebView mContext;

            ReactWebViewBridge(ReactWebView c) {
                mContext = c;
            }

            @JavascriptInterface
            public void postMessage(String message) {
                mContext.onMessage(message);
            }
        }

        /**
         * WebView must be created with an context of the current activity
         * <p>
         * Activity Context is required for creation of dialogs internally by WebView
         * Reactive Native needed for access to ReactNative internal system functionality
         */
        public ReactWebView(ThemedReactContext reactContext) {
            super(reactContext);
        }

        @Override
        public void onHostResume() {
            // do nothing
        }

        @Override
        public void onHostPause() {
            // do nothing
        }

        @Override
        public void onHostDestroy() {
            cleanupCallbacksAndDestroy();
        }

        public void setInjectedJavaScript(@Nullable String js) {
            injectedJS = js;
        }

        public void setInjectedOnStartLoadingJavaScript(@Nullable String js) {
            injectedOnStartLoadingJS = js;
        }

        public void setMessagingEnabled(boolean enabled) {
            if (messagingEnabled == enabled) {
                return;
            }

            messagingEnabled = enabled;
            if (enabled) {
                addJavascriptInterface(new ReactWebViewBridge(this), BRIDGE_NAME);
                linkBridge();
            } else {
                removeJavascriptInterface(BRIDGE_NAME);
            }
        }

        public void callInjectedJavaScript() {
            if (getSettings().getJavaScriptEnabled() &&
                    injectedJS != null &&
                    !TextUtils.isEmpty(injectedJS)) {
                loadUrl("javascript:(function() {\n" + injectedJS + ";\n})();");
            }
        }

        public void linkBridge() {
            if (messagingEnabled) {
                if (debug && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    // See isNative in lodash
                    String testPostMessageNative = "String(window.postMessage) === String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')";
                    WebViewBridgeManager.evaluateJavascript(this, testPostMessageNative, new ValueCallback<String>() {
                        @Override
                        public void onReceiveValue(String value) {
                            if (value.equals("true")) {
                                FLog.w(ReactConstants.TAG, "Setting onMessage on a WebView overrides existing values of window.postMessage, but a previous value was defined");
                            }
                        }
                    });
                }

                loadUrl("javascript:(" +
                        "window.originalPostMessage = window.postMessage," +
                        "window.postMessage = function(data) {" +
                        BRIDGE_NAME + ".postMessage(String(data));" +
                        "}" +
                        ")");
            }
        }

        public void onMessage(String message) {
            dispatchEvent(this, new TopMessageEvent(this.getId(), message));
        }

        private void cleanupCallbacksAndDestroy() {
            setWebViewClient(null);
            destroy();
        }

        public void setStatusBridge(StatusBridge bridge) {
            this.bridge = bridge;
        }

        private ReactWebChromeClient chromeClient;

        @Override
        public void setWebChromeClient(WebChromeClient client) {
            super.setWebChromeClient(client);
            chromeClient = (ReactWebChromeClient) client;
        }

        public ReactWebChromeClient getWebChromeClient() {
            return this.chromeClient;
        }

        public StatusBridge getStatusBridge() {
            return this.bridge;
        }
    }

    private class ReactWebViewClient extends WebViewClient {

        private boolean mLastLoadFailed = false;

        @Override
        public void onPageFinished(WebView webView, String url) {
            super.onPageFinished(webView, url);

            if (!mLastLoadFailed) {
                ReactWebView reactWebView = (ReactWebView) webView;
                reactWebView.callInjectedJavaScript();
                reactWebView.linkBridge();
                emitFinishEvent(webView, url);
            }
        }

        @Override
        public void onPageStarted(WebView webView, String url, Bitmap favicon) {
            super.onPageStarted(webView, url, favicon);
            mLastLoadFailed = false;

            dispatchEvent(
                    webView,
                    new TopLoadingStartEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url.startsWith("http://") || url.startsWith("https://") ||
                    url.startsWith("file://")) {
                return false;
            } else {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                view.getContext().startActivity(intent);
                return true;
            }
        }

        @Override
        public void onReceivedError(
                WebView webView,
                int errorCode,
                String description,
                String failingUrl) {
            super.onReceivedError(webView, errorCode, description, failingUrl);
            mLastLoadFailed = true;

            // In case of an error JS side expect to get a finish event first, and then get an error event
            // Android WebView does it in the opposite way, so we need to simulate that behavior
            emitFinishEvent(webView, failingUrl);

            WritableMap eventData = createWebViewEvent(webView, failingUrl);
            eventData.putDouble("code", errorCode);
            eventData.putString("description", description);

            dispatchEvent(
                    webView,
                    new TopLoadingErrorEvent(webView.getId(), eventData));
        }

        @Override
        public void doUpdateVisitedHistory(WebView webView, String url, boolean isReload) {
            super.doUpdateVisitedHistory(webView, url, isReload);

            dispatchEvent(
                    webView,
                    new TopLoadingStartEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        private void emitFinishEvent(WebView webView, String url) {
            dispatchEvent(
                    webView,
                    new TopLoadingFinishEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        private WritableMap createWebViewEvent(WebView webView, String url) {
            WritableMap event = Arguments.createMap();
            event.putDouble("target", webView.getId());
            // Don't use webView.getUrl() here, the URL isn't updated to the new value yet in callbacks
            // like onPageFinished
            event.putString("url", url);
            event.putBoolean("loading", !mLastLoadFailed && webView.getProgress() != 100);
            event.putString("title", webView.getTitle());
            event.putBoolean("canGoBack", webView.canGoBack());
            event.putBoolean("canGoForward", webView.canGoForward());
            return event;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String urlStr = request.getUrl().toString();
            Uri url = request.getUrl();
            Log.d(TAG, "\nnew request ");
            Log.d(TAG, "url " + urlStr);
            Log.d(TAG, "host " + request.getUrl().getHost());
            Log.d(TAG, "path " + request.getUrl().getPath());
            Log.d(TAG, "main " + request.isForMainFrame());
            Log.d(TAG, "headers " + request.getRequestHeaders().toString());
            Log.d(TAG, "method " + request.getMethod());
            if (!request.isForMainFrame() || urlStr == null || urlStr.trim().equals("") || !(urlStr.startsWith("http") && !urlStr.startsWith("www")) || urlStr.contains("|")) {
                return super.shouldInterceptRequest(view, request);
            }

            try {
                Request req = new Request.Builder()
                        .url(urlStr)
                        .header("User-Agent", userAgent)
                        .build();

                Response response = client.newCall(req).execute();
                Log.d(TAG, "response headers " + response.headers().toString());
                Log.d(TAG, "response code " + response.code());
                Log.d(TAG, "response suc " + response.isSuccessful());

                if (response.isRedirect()) {
                    return super.shouldInterceptRequest(view, request);
                }
                InputStream is = response.body().byteStream();
                MediaType contentType = response.body().contentType();
                Charset charset = contentType != null ? contentType.charset(UTF_8) : UTF_8;
                if (response.code() == 200) {
                    is = new InputStreamWithInjectedJS(is, ((ReactWebView) view).injectedOnStartLoadingJS, charset);
                }
                return new WebResourceResponse("text/html", charset.name(), is);
            } catch (IOException e) {
                return new WebResourceResponse("text/html", "UTF-8", null);
            }
        }
    }

    @Override
    public void onDropViewInstance(WebView webView) {
        //super.onDropViewInstance(webView);
        ((ThemedReactContext) webView.getContext()).removeLifecycleEventListener((ReactWebView) webView);
        ((ReactWebView) webView).cleanupCallbacksAndDestroy();
    }

    private static void dispatchEvent(WebView webView, Event event) {
        ReactContext reactContext = (ReactContext) webView.getContext();
        EventDispatcher eventDispatcher =
                reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        eventDispatcher.dispatchEvent(event);
    }
}
