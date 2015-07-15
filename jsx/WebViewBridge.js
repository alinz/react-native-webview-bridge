'use strict';

var React = require('react-native');

var {
  WebView,
  Component,
  NativeModules: {
    WebViewManager
  }
} = React;

var WEB_VIEW_BRIDGE_REF = 'WEBVIEW_BRIDGE';

class WebViewBridge extends Component {
  constructor(props) {
    super(props);
  }

 /*
  * returns internal handler id
  */
  getWebViewBridgeHandler() {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    return ref.getWebWiewHandle();
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
    //setup the internal variables of webview bridge
    WebViewManager.bridgeSetup(this.getWebViewBridgeHandler());
  }

  componentWillUnmount() {
    //removed the internal variables from objective-c side related to
    //handler id
    WebViewManager.callbackCleanup(this.getWebViewBridgeHandler());
  }

  render() {
    return (
      <WebView
        ref={WEB_VIEW_BRIDGE_REF}
        {...this.props}/>
    );
  }
}

module.exports = WebViewBridge;
