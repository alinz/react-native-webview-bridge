'use strict';

var React = require('react-native');

var {
  WebView,
  NativeModules: {
    WebViewManager
  }
} = React;

class WebViewBridge extends WebView {
  constructor(props) {
    super(props);
  }

 /*
  * call the callback with handler id
  * this is a hack to make the new version working properly.
  * returns void
  */
  getWebViewBridgeHandler(fn) {
    //this method defines in WebView component.
    var handler = this.getWebWiewHandle || this.getWebViewHandle;

    setTimeout(() => {
      var handlerId = handler();
      fn(handlerId);
    }, 0);
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
    });
  }
}

module.exports = WebViewBridge;
