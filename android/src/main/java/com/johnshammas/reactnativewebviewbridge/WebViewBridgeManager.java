package com.johnshammas.reactnativewebviewbridge;

import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIProp;

public class WebViewBridgeManager extends SimpleViewManager<WebViewBridge> {
    public static final String REACT_CLASS = "WebViewAndroid";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebViewBridge createViewInstance(ThemedReactContext context) {
        return new WebViewBridge(context);
    }

    @UIProp(UIProp.Type.STRING)
    public static final String PROP_URL = "url";

    @Override
    public void updateView(WebViewBridge view, CatalystStylesDiffMap props) {
        super.updateView(view, props);

        if (props.hasKey(PROP_URL)) {
            view.setURL(props.getString(PROP_URL));
        }
    }
}
