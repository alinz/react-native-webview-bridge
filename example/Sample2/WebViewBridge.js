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

  evalScript(value) {
    var ref = this.refs[WEB_VIEW_BRIDGE_REF];
    WebViewManager.eval(ref.getWebWiewHandle(), value);
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
