package com.github.alinz.reactnativewebviewbridge;

import android.webkit.WebView;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.ArrayList;
import java.util.Map;

import javax.annotation.Nullable;


import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.os.Environment;
import android.webkit.URLUtil;
import android.widget.Toast;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import java.nio.charset.StandardCharsets;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;

import com.github.alinz.reactnativewebviewbridge.AndroidWebViewModule;

public class WebViewBridgeManager extends ReactWebViewManager {
    private Activity mActivity = null;
    private WebViewBridgePackage aPackage;

    private static final String REACT_CLASS = "RCTWebViewBridge";

    public static final int COMMAND_SEND_TO_BRIDGE = 101;

    public void setPackage(WebViewBridgePackage aPackage){
        this.aPackage = aPackage;
    }

    public WebViewBridgePackage getPackage(){
        return this.aPackage;
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

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        WebView view = super.createViewInstance(reactContext);
        view.addJavascriptInterface(new JavascriptBridge(view), "WebViewBridge");

        //Now do our own setWebChromeClient, patching in file chooser support
        final AndroidWebViewModule module = this.aPackage.getModule();

        view.setWebChromeClient(new WebChromeClient(){

            public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
                module.setUploadMessage(uploadMsg);
                module.openFileChooserView();

            }

            public boolean onJsConfirm (WebView view, String url, String message, JsResult result){
                return true;
            }

            public boolean onJsPrompt (WebView view, String url, String message, String defaultValue, JsPromptResult result){
                return true;
            }

            // For Android < 3.0
            public void openFileChooser(ValueCallback<Uri> uploadMsg) {
                module.setUploadMessage(uploadMsg);
                module.openFileChooserView();
            }

            // For Android  > 4.1.1
            public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture) {
                module.setUploadMessage(uploadMsg);
                module.openFileChooserView();
            }

            // For Android > 5.0
            public boolean onShowFileChooser (WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                Log.d("customwebview", "onShowFileChooser");

                module.setmUploadCallbackAboveL(filePathCallback);
                if (module.grantFileChooserPermissions()) {
                    module.openFileChooserView();
                } else {
                    Toast.makeText(module.getActivity().getApplicationContext(), "Cannot upload files as permission was denied. Please provide permission to access storage, in order to upload files.", Toast.LENGTH_LONG).show();
                }
                return true;
            }
        });

        view.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(String url, String userAgent,
                    String contentDisposition, String mimetype,
                    long contentLength) {

                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

                //Try to extract filename from contentDisposition, otherwise guess using URLUtil
                String fileName = "";
                try {
                    fileName = contentDisposition.replaceFirst("(?i)^.*filename=\"?([^\"]+)\"?.*$", "$1");
                    fileName = URLDecoder.decode(fileName, "UTF-8");
                } catch (Exception e) {
                    System.out.println("Error extracting filename from contentDisposition: " + e);
                    System.out.println("Falling back to URLUtil.guessFileName");
                    fileName = URLUtil.guessFileName(url,contentDisposition,mimetype);
                }
                String downloadMessage = "Downloading " + fileName;

                //Attempt to add cookie, if it exists
                URL urlObj = null;
                try {
                    urlObj = new URL(url);
                    String baseUrl = urlObj.getProtocol() + "://" + urlObj.getHost();
                    String cookie = CookieManager.getInstance().getCookie(baseUrl);
                    request.addRequestHeader("Cookie", cookie);
                    System.out.println("Got cookie for DownloadManager: " + cookie);
                } catch (MalformedURLException e) {
                    System.out.println("Error getting cookie for DownloadManager: " + e.toString());
                    e.printStackTrace();
                }

                //Finish setting up request
                request.addRequestHeader("User-Agent", userAgent);
                request.setTitle(fileName);
                request.setDescription(downloadMessage);
                request.allowScanningByMediaScanner();
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

                module.setDownloadRequest(request);

                if (module.grantFileDownloaderPermissions()) {
                    module.downloadFile();
                } else {
                    Toast.makeText(module.getActivity().getApplicationContext(), "Cannot download files as permission was denied. Please provide permission to write to storage, in order to download files.", Toast.LENGTH_LONG).show();
                }
            }
        });

        return view;
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
}