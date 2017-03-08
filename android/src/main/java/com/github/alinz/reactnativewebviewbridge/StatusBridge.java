package com.github.alinz.reactnativewebviewbridge;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.app.Activity;

import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.OkHttpClient.Builder;
import java.util.concurrent.TimeUnit;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import com.facebook.react.uimanager.ThemedReactContext;

class StatusBridge {
    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private WebView webView;
    private ThemedReactContext context;
    private OkHttpClient client;

    public StatusBridge(ThemedReactContext context, WebView webView) {
        this.context = context;
        this.webView = webView;
        Builder b = new Builder();
        b.readTimeout(310, TimeUnit.SECONDS);
        client = b.build();
    }

    @JavascriptInterface
    public void sendRequest(final String host, final String callbackId, final String json) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                RequestBody body = RequestBody.create(JSON, json);
                Request request = new Request.Builder()
                        .url(host)
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    String rpcResponse =  response.body().string().trim();

                    final String script = "httpCallback('" + callbackId + "','" + rpcResponse + "');";
                    final Activity activity = context.getCurrentActivity();
                    activity.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            webView.evaluateJavascript(script, null);
                        }
                    });
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        };
        thread.start();
    }

    @JavascriptInterface
    public String sendRequestSync(final String host, final String json) {

        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder()
                .url(host)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            String rpcResponse = response.body().string().trim();

            return rpcResponse;
        } catch (IOException e) {
            e.printStackTrace();

            return "";
        }
    }
}
