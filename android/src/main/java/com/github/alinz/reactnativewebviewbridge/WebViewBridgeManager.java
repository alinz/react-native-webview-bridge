package com.github.alinz.reactnativewebviewbridge;

import android.content.Context;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Map;

import javax.annotation.Nullable;

public class WebViewBridgeManager extends ReactWebViewManager {
    private static final String REACT_CLASS = "RCTWebViewBridge";

    public static final int COMMAND_INJECT_WEBVIEW_BRIDGE = 101;
    public static final int COMMAND_INJECT_RPC = 102;
    public static final int COMMAND_SEND_TO_BRIDGE = 103;
    public static final int COMMAND_CLOSE_KEYBOARD = 104;

    private ReactApplicationContext reactApplicationContext;

    public WebViewBridgeManager(ReactApplicationContext reactApplicationContext) {
        super();
        //we need to know the context because we need to load files from asset
        this.reactApplicationContext = reactApplicationContext;
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
        commandsMap.put("injectWebViewBridge", COMMAND_INJECT_WEBVIEW_BRIDGE);
        commandsMap.put("injectRPC", COMMAND_INJECT_RPC);
        commandsMap.put("closeKeyboard", COMMAND_CLOSE_KEYBOARD);

        return commandsMap;
    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        WebView root = super.createViewInstance(reactContext);
        root.addJavascriptInterface(new JavascriptBridge(root), "WebViewBridge");
        return root;
    }

    @Override
    public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);

        switch (commandId) {
            case COMMAND_SEND_TO_BRIDGE:
                sendToBridge(root, args.getString(0));
                break;
            case COMMAND_INJECT_WEBVIEW_BRIDGE:
                injectWebViewBridgeScript(root);
                break;
            case COMMAND_INJECT_RPC:
                injectWebViewBridgeRPCScript(root);
                break;
            case COMMAND_CLOSE_KEYBOARD:
                closeKeyboard(root);
                break;
            default:
                //do nothing!!!!
        }
    }

    private static String inputStreamToString(InputStream input) throws IOException {
        StringBuilder builder = new StringBuilder();
        int ch;
        while((ch = input.read()) != -1){
            builder.append((char)ch);
        }
        input.close();
        return builder.toString();
    }

    private static String loadAsset(String filename, final Context context) {
        String output = null;

        try {
            InputStream inputStream = context.getAssets().open(filename);
            output = inputStreamToString(inputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return output;
    }

    private void injectWebViewBridgeScript(WebView root) {
        String injectContent = loadAsset("WebViewBridge.js", this.reactApplicationContext);
        if (injectContent != null) {
            evaluateJavascript(root, injectContent);
        }
    }

    private void injectWebViewBridgeRPCScript(WebView root) {
        String injectContent = loadAsset("WebViewBridgeRPC.js", this.reactApplicationContext);
        if (injectContent != null) {
            evaluateJavascript(root, injectContent);
        }
    }

    private void sendToBridge(WebView root, String message) {
        String script = "(function(){ if (WebViewBridge && WebViewBridge.__push__) { WebViewBridge.__push__(\"" + message + "\"); } }());";
        WebViewBridgeManager.evaluateJavascript(root, script);
    }

    private void closeKeyboard(WebView root) {
        InputMethodManager inputManager = (InputMethodManager)this.reactApplicationContext.getSystemService(Context.INPUT_METHOD_SERVICE);
        inputManager.hideSoftInputFromWindow(root.getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
    }

    static private void evaluateJavascript(WebView root, String javascript) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            root.evaluateJavascript(javascript, null);
        } else {
            root.loadUrl("javascript:" + javascript);
        }
    }

    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebView root, @Nullable String injectedJavaScript) {
        evaluateJavascript(root, injectedJavaScript);
    }

    @ReactProp(name = "allowFileAccessFromFileURLs")
    public void setAllowFileAccessFromFileURLs(WebView root, boolean allows) {
        root.getSettings().setAllowFileAccessFromFileURLs(allows);
    }

    @ReactProp(name = "allowUniversalAccessFromFileURLs")
    public void setAllowUniversalAccessFromFileURLs(WebView root, boolean allows) {
        root.getSettings().setAllowUniversalAccessFromFileURLs(allows);
    }
}
