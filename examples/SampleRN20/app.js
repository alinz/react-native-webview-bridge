/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  WebView
} = React;

var WebViewBridge = require('react-native-webview-bridge');

const injectScript = `
  (function () {
    if (WebViewBridge) {

      WebViewBridge.onMessage = function (message) {
        alert(message);
      };

      WebViewBridge.send("hello from webview");

    } else {
      window.location.href = "yahoo.ca";
    }
  }());
`;

var Sample2 = React.createClass({
  onBridgeMessage: function (message) {
    if (message == "hello from webview") {
      console.log(message);
      this.refs.webviewbridge.sendToBridge("hello from react-native");
    }
  },
  render: function() {
    return (
      <WebViewBridge
        ref="webviewbridge"
        onBridgeMessage={this.onBridgeMessage}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
        source={{uri: "https://google.com"}}/>
    );
  }
});

module.exports = Sample2;
