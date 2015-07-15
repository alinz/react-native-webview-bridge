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
  * returns internal handler id
  */
  getWebViewBridgeHandler() {
    //this method defines in WebView component.
    return this.getWebWiewHandle();
  }

 /*
  * inject script into webView
  */
  injectBridgeScript() {
    WebViewManager.injectBridgeScript(this.getWebViewBridgeHandler());
  }

  onMessage(cb) {
    WebViewManager.onMessage(this.getWebViewBridgeHandler(), (messages) => {
      messages.forEach((message) => {
        cb(message);
      });

      //re-register the callback again
      this.onMessage(cb);
    });
  }

  evalScript(value) {
    WebViewManager.eval(this.getWebViewBridgeHandler(), value);
  }

  send(message) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    WebViewManager.send(this.getWebViewBridgeHandler(), message);
  }

  componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }
    //setup the internal variables of webview bridge
    WebViewManager.bridgeSetup(this.getWebViewBridgeHandler());
  }

  componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillMount();
    }
    //removed the internal variables from objective-c side related to
    //handler id
    WebViewManager.callbackCleanup(this.getWebViewBridgeHandler());
  }
}

module.exports = WebViewBridge;
