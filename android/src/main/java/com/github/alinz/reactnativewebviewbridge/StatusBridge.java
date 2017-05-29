package com.github.alinz.reactnativewebviewbridge;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.app.Activity;

import com.facebook.react.uimanager.ThemedReactContext;
import com.github.status_im.status_go.cmd.Statusgo;

class StatusBridge {
    private WebView webView;
    private ThemedReactContext context;

    public StatusBridge(ThemedReactContext context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public void sendRequest(final String host, final String callbackId, final String json) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                String rpcResponse = Statusgo.CallRPC(json).trim();

                final String script = "httpCallback('" + callbackId + "','" + rpcResponse + "');";
                final Activity activity = context.getCurrentActivity();
                activity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        evaluateJavascript(webView, script);
                    }
                });
            }
        };
        thread.start();
    }

    @JavascriptInterface
    public String sendRequestSync(final String host, final String json) {
        return Statusgo.CallRPC(json);
    }

    static private void evaluateJavascript(WebView root, String javascript) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            root.evaluateJavascript(javascript, null);
        } else {
            root.loadUrl("javascript:" + javascript);
        }
    }
}
