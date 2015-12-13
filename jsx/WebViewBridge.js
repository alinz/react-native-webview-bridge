'use strict';

var React = require('react-native');

// The implementation of WebView on iOS is very different than implemented
// on Android. Thus, having platform-specific code here for the time being.
if (React.StatusBarIOS) {

    var {
      WebView,
      NativeModules: {
        WebViewManager
      }
    } = React;

    class WebViewBridge extends WebView {
      constructor(props) {
        super(props);
        this.handlerId = 0;
      }

     /*
      * call the callback with handler id
      */
      getWebViewBridgeHandler(fn) {
        //this method defines in WebView component.
        //in react-native 0.6 and below, getWebWiewHandle
        //in react-native 0.7 and above getWebViewHandle
        var handler = this.getWebWiewHandle || this.getWebViewHandle;

        if (this.handlerId) {
          fn(this.handlerId);
        } else {
          // this is a hack to get the handleId correctly and
          // also avoid race condition.
          setTimeout(() => {
            this.handlerId = handler();
            fn(this.handlerId);
          }, 0);
        }
      }

     /*
      * inject script into webView
      */
      injectBridgeScript() {
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.injectBridgeScript(handlerId);
        });
      }

      onMessage(cb) {
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.onMessage(handlerId, (messages) => {
            messages.forEach((message) => {
              cb(message);
            });

            //re-register the callback again
            this.onMessage(cb);
          });
        });
      }

      evalScript(value) {
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.eval(handlerId, value);
        });
      }

      send(message) {
        if (typeof message !== 'string') {
          message = JSON.stringify(message);
        }

        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.send(handlerId, message);
        });
      }

      print() {
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.print(handlerId);
        });
      }

      componentDidMount() {
        if (super.componentDidMount) {
          super.componentDidMount();
        }
        //setup the internal variables of webview bridge
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.bridgeSetup(handlerId);
        });
      }

      componentWillUnmount() {
        if (super.componentWillUnmount) {
          super.componentWillMount();
        }
        //removed the internal variables from objective-c side related to
        //handler id
        this.getWebViewBridgeHandler((handlerId) => {
          WebViewManager.callbackCleanup(handlerId);
          this.handlerId = 0;
        });
      }
    }

    module.exports = WebViewBridge;

} else {

    var { requireNativeComponent, PropTypes, View, DeviceEventEmitter } = React;
    var NativeWebView = requireNativeComponent('WebViewAndroid', WebViewBridge);
    var RCTUIManager = React.NativeModules.UIManager;

    var _cbQueue = [];

    var WEBVIEW_REF = 'androidWebView';
    var ID = (new Date()).getTime() + "";

    class WebViewBridge extends React.Component {
        constructor() {
            super();
            this.handlerId = 0;
        }

        componentWillMount() {
            DeviceEventEmitter.addListener("webViewMessage", (message) => {
                if (message.webView == ID) {
                    for (var i = 0, j = _cbQueue.length; i < j; i++) {
                        _cbQueue[i](message.message);
                    }
                }
            });
        }

        _onChange(event) {
            if (this.props.onChange) {
                this.props.onChange(event.nativeEvent);
            }
        }

        _onNavigationStateChange(event) {
            if (this && this.props && this.props.onNavigationStateChange) {
                this.props.onNavigationStateChange(event.nativeEvent);
            }
        }

        getWebViewHandle() {
            return React.findNodeHandle(this.refs[WEBVIEW_REF]);
        }

        injectBridgeScript() {
            RCTUIManager.dispatchViewManagerCommand(
                this.getWebViewHandle(),
                RCTUIManager.WebViewAndroid.Commands.injectBridgeScript,
                null
            );
        }

        goBack() {
            RCTUIManager.dispatchViewManagerCommand(
                this.getWebViewHandle(),
                RCTUIManager.WebViewAndroid.Commands.goBack,
                null
            );
        }
        goForward() {
            RCTUIManager.dispatchViewManagerCommand(
                this.getWebViewHandle(),
                RCTUIManager.WebViewAndroid.Commands.goForward,
                null
            );
        }
        reload() {
            RCTUIManager.dispatchViewManagerCommand(
                this.getWebViewHandle(),
                RCTUIManager.WebViewAndroid.Commands.reload,
                null
            );
        }

        send(message) {
            RCTUIManager.dispatchViewManagerCommand(
                this.getWebViewHandle(),
                RCTUIManager.WebViewAndroid.Commands.send,
                [message]
            );
        }

        onMessage(cb) {
            _cbQueue.push(cb);
        }

        render() {
            return (
                <NativeWebView
                    {...this.props}
                    webViewId={ID}
                    ref={WEBVIEW_REF} />
            );
        }
    }

    WebViewBridge.propTypes = {
        ...View.propTypes,
        url: PropTypes.string,
        html: PropTypes.string,
        htmlCharset: PropTypes.string,
        injectedJavaScript: PropTypes.string,
        disableCookies: PropTypes.bool,
        javaScriptEnabled: PropTypes.bool,
        geolocationEnabled: PropTypes.bool,
        builtInZoomControls: PropTypes.bool,
        onNavigationStateChange: PropTypes.func
    };

    module.exports = WebViewBridge;

}
