package com.github.alinz.reactnativewebviewbridge;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.webkit.ValueCallback;
import android.widget.Toast;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.common.annotations.VisibleForTesting;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.events.RCTEventEmitter;


public class AndroidWebViewModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private ValueCallback<Uri> mUploadMessage;
    private ValueCallback<Uri[]> mUploadCallbackAboveL;
    private DownloadManager.Request downloadRequest;
    private static final int FILE_CHOOSER_PERMISSION_REQUEST = 1;
    private static final int FILE_DOWNLOAD_PERMISSION_REQUEST = 2;

    @VisibleForTesting
    public static final String REACT_CLASS = "AndroidWebViewModule";

    private WebView webView;
    private ReactApplicationContext reactContext;

    public void JavascriptBridge(WebView webView) {
        this.webView = webView;
    }

    @JavascriptInterface
    public void send(String message) {
        WritableMap event = Arguments.createMap();
        event.putString("message", message);
        ReactContext reactContext = (ReactContext) this.webView.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                this.webView.getId(),
                "topChange",
                event);
    }

    public AndroidWebViewModule(ReactApplicationContext context){
        super(context);
        context.addActivityEventListener(this);
    }

    private WebViewBridgePackage aPackage;

    public void setPackage(WebViewBridgePackage aPackage) {
        this.aPackage = aPackage;
    }

    public WebViewBridgePackage getPackage() {
        return this.aPackage;
    }

    public void setContext( ReactApplicationContext context )
    {
        this.reactContext = context;
    }

    public ReactApplicationContext getContext()
    {
        return this.reactContext;
    }

    @Override
    public String getName(){
        return REACT_CLASS;
    }

    @SuppressWarnings("unused")
    public Activity getActivity() {
        return getCurrentActivity();
    }

    public void setUploadMessage(ValueCallback<Uri> uploadMessage) {
        mUploadMessage = uploadMessage;
    }

    public void setmUploadCallbackAboveL(ValueCallback<Uri[]> mUploadCallbackAboveL) {
        this.mUploadCallbackAboveL = mUploadCallbackAboveL;
    }

    public void setDownloadRequest(DownloadManager.Request request) {
        this.downloadRequest = request;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1) {
            if (null == mUploadMessage && null == mUploadCallbackAboveL){
                return;
            }
            Uri result = data == null || resultCode != Activity.RESULT_OK ? null : data.getData();
            if (mUploadCallbackAboveL != null) {
                onActivityResultAboveL(requestCode, resultCode, data);
            } else if (mUploadMessage != null) {
                mUploadMessage.onReceiveValue(result);
                mUploadMessage = null;
            }
        }
    }
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void onActivityResultAboveL(int requestCode, int resultCode, Intent data) {
        if (requestCode != 1 || mUploadCallbackAboveL == null) {
            return;
        }
        Uri[] results = null;
        if (resultCode == Activity.RESULT_OK) {
            if (data != null) {
                String dataString = data.getDataString();
                ClipData clipData = data.getClipData();
                if (clipData != null) {
                    results = new Uri[clipData.getItemCount()];
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        ClipData.Item item = clipData.getItemAt(i);
                        results[i] = item.getUri();
                    }
                }
                if (dataString != null)
                    results = new Uri[]{Uri.parse(dataString)};
            }
        }
        mUploadCallbackAboveL.onReceiveValue(results);
        mUploadCallbackAboveL = null;
    }

    public void openFileChooserView(){
        try {
            Intent openableFileIntent = new Intent(Intent.ACTION_GET_CONTENT);
            openableFileIntent.addCategory(Intent.CATEGORY_OPENABLE);
            openableFileIntent.setType("*/*");

            final Intent chooserIntent = Intent.createChooser(openableFileIntent, "Choose File");
            getActivity().startActivityForResult(chooserIntent, 1);
        } catch (Exception e) {
            Log.d("customwebview", e.toString());
        }
    }

    public void downloadFile() {
        DownloadManager dm = (DownloadManager) getActivity().getBaseContext().getSystemService(Context.DOWNLOAD_SERVICE);
        String downloadMessage = "Downloading";

        dm.enqueue(this.downloadRequest);

        Toast.makeText(getActivity().getApplicationContext(), downloadMessage, Toast.LENGTH_LONG).show();
    }

    // NB: parts of the permission management are adapted, with significant modification, from 
    //   https://lakshinkarunaratne.wordpress.com/2018/03/11/enhancing-the-react-native-webview-part-2-supporting-file-downloads-in-android/

    private PermissionAwareActivity getPermissionAwareActivity() {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            throw new IllegalStateException("Tried to use permissions API while not attached to an " +
                    "Activity.");
        } else if (!(activity instanceof PermissionAwareActivity)) {
            throw new IllegalStateException("Tried to use permissions API but the host Activity doesn't" +
                    " implement PermissionAwareActivity.");
        }
        return (PermissionAwareActivity) activity;
    }

    private PermissionListener webviewFileChooserPermissionListener = new PermissionListener() {
        @Override
        public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
            switch (requestCode) {
                case FILE_CHOOSER_PERMISSION_REQUEST: {
                    // If request is cancelled, the result arrays are empty.
                    if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                        if (mUploadCallbackAboveL != null){
                            openFileChooserView();
                        }
                    } else {
                        Toast.makeText(getActivity().getApplicationContext(), "Cannot upload files as permission was denied. Please provide permission to access storage, in order to upload files.", Toast.LENGTH_LONG).show();
                    }
                    return true;
                }
            }
            return false;
        }
    };

    private PermissionListener webviewFileDownloaderPermissionListener = new PermissionListener() {
        @Override
        public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
            switch (requestCode) {
                case FILE_DOWNLOAD_PERMISSION_REQUEST: {
                    // If request is cancelled, the result arrays are empty.
                    if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                        if(downloadRequest != null){
                            downloadFile();
                        }
                    } else {
                        Toast.makeText(getActivity().getApplicationContext(), "Cannot download files as permission was denied. Please provide permission to write to storage, in order to download files.", Toast.LENGTH_LONG).show();
                    }
                    return true;
                }
            }
            return false;
        }
    };

    public boolean grantFileChooserPermissions() {
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.M){
            return true;
        }
        boolean result = true;
        if (ContextCompat.checkSelfPermission(this.getActivity(),Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            result = false;
        }

        if(!result){
            PermissionAwareActivity activity = getPermissionAwareActivity();
            activity.requestPermissions(new String[]{ Manifest.permission.READ_EXTERNAL_STORAGE }, FILE_CHOOSER_PERMISSION_REQUEST, webviewFileChooserPermissionListener);
        }
        return result;
    }

    public boolean grantFileDownloaderPermissions() {
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.M){
            return true;
        }
        boolean result = true;
        if (ContextCompat.checkSelfPermission(this.getActivity(),Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            result = false;
        }

        if(!result){
            PermissionAwareActivity activity = getPermissionAwareActivity();
            activity.requestPermissions(new String[]{ Manifest.permission.WRITE_EXTERNAL_STORAGE }, FILE_DOWNLOAD_PERMISSION_REQUEST, webviewFileDownloaderPermissionListener);
        }
        return result;
    }

    public void onNewIntent(Intent intent) {}
}