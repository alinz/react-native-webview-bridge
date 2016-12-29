package com.github.alinz.reactnativewebviewbridge;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

class StatusBridge {
    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    public static final String URL = "http://localhost:8545";

    private WebView webView;
    private Context context;
    private OkHttpClient client = new OkHttpClient();

    public StatusBridge(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public String sendRequest(String json) {
        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder()
            .url(URL)
            .post(json)
            .build();

        try (Response response = client.newCall(request).execute()) {
            Toast.makeText(context, response.body().string(), Toast.LENGTH_LONG).show();
            return response.body().string();
        }
    }
}
