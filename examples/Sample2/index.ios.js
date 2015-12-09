/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var WebViewBridge = require('react-native-webview-bridge');

const injectScript = `
  (function () {
    if (WebViewBridge) {

      WebViewBridge.onMessage = function (message) {
        alert('got a message from Native: ' + message);

        WebViewBridge.send("message from webview");
      };



    }
  }());
`;

var Sample2 = React.createClass({
  componentDidMount() {
    setTimeout(() => {
      this.refs.webviewbridge.sendToBridge("hahaha");
    }, 5000);
  },
  onBridgeMessage: function (message) {
    console.log(message);
  },
  render: function() {
    return (
      <WebViewBridge
        ref="webviewbridge"
        onBridgeMessage={this.onBridgeMessage}
        injectedJavaScript={injectScript}
        onBridgeMessage={(message) => {
          console.log(message);
        }}
        url={"http://google.com"}/>
    );
  }
});

AppRegistry.registerComponent('Sample2', () => Sample2);
