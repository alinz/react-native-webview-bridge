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

  onMessage(cb) {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    WebViewManager.onMessage(ref.getWebWiewHandle(), (messages) => {
      messages.forEach((message) => {
        cb(message);
      });

      //re register the callback again
      this.onMessage(cb);
    });
  }

  evalScript(value) {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    WebViewManager.eval(ref.getWebWiewHandle(), value);
  }

  send(message) {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];

    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    WebViewManager.send(ref.getWebWiewHandle(), message);
  }

  componentDidMount() {
    //setup the internal variables of webview bridge
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    WebViewManager.bridgeSetup(ref.getWebWiewHandle());

    //inject script into webView
    WebViewManager.injectBridgeScript(ref.getWebWiewHandle());
  }

  componentWillUnmount() {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    WebViewManager.callbackCleanup(ref.getWebWiewHandle());
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
