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

    var { requireNativeComponent, PropTypes, View } = React;

    var NativeWebView = requireNativeComponent('WebViewAndroid', WebViewBridge);

    class WebViewBridge extends React.Component {
      constructor() {
        super();
        this._onChange = this._onChange.bind(this);
      }

      _onChange(event) {
        if (this.props.onChange) {
          this.props.onChange(event.nativeEvent);
        }
      }

      render() {
        return (
          <NativeWebView
            {...this.props} onChange={this._onChange}
            values={this.props.values} selected={this.props.selected} />
        );
      }
    }

    WebViewBridge.propTypes = {
      ...View.propTypes,
      onChange: PropTypes.func,
      url: PropTypes.string
    };

    WebViewBridge.defaultProps = {

    }

    module.exports = WebViewBridge;

}
