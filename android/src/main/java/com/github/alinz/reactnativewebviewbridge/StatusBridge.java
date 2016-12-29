package com.github.alinz.reactnativewebviewbridge;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import android.app.Activity;

import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.StringReader;
import android.util.JsonReader;
import com.facebook.react.uimanager.ThemedReactContext;

class StatusBridge {
    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    public static final String URL = "http://localhost:8545";

    private WebView webView;
    private ThemedReactContext context;
    private OkHttpClient client = new OkHttpClient();

    public StatusBridge(ThemedReactContext context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public void sendRequest(final String callbackId, final String json) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                RequestBody body = RequestBody.create(JSON, json);
                Request request = new Request.Builder()
                        .url(URL)
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    //Toast.makeText(context, response.body().string(), Toast.LENGTH_LONG).show();
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

                }
            }
        };

        thread.start();
    }
}
