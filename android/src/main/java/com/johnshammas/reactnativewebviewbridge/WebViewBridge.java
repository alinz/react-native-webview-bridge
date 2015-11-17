package com.johnshammas.reactnativewebviewbridge;

import android.content.Context;
import android.os.SystemClock;
import android.support.v7.widget.AppCompatSpinner;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;

import java.util.ArrayList;

public class WebViewBridge extends WebView {

    private Context mContext;
    private boolean firstEventFired = false;
    private int mSelected = 0;

    public WebViewBridge(ThemedReactContext context) {
        super(context);
        mContext = context;
        this.getSettings().setJavaScriptEnabled(true);
    }

    private final Runnable mLayoutRunnable = new Runnable() {
        @Override
        public void run() {
            measure(MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
            layout(getLeft(), getTop(), getRight(), getBottom());
        }
    };

    public void setURL(String url) {
        this.setWebViewClient(new WebViewClient());
        this.loadUrl(url);
    }

    public void setHTML(String html) {
        this.setWebViewClient(new WebViewClient());
        this.loadData(html, "text/html", null);
    }

    @Override
    public void requestLayout() {
        super.requestLayout();
        post(mLayoutRunnable);
    }
}
