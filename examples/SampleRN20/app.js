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
        if (message === "hello from react-native") {
          WebViewBridge.send("got the message inside webview");
        }
      };

      WebViewBridge.send("hello from webview");
    }
  }());
`;

var Sample2 = React.createClass({
  onBridgeMessage: function (message) {
    const { webviewbridge } = this.refs;

    switch (message) {
      case "hello from webview":
        webviewbridge.sendToBridge("hello from react-native");
        break;
      case "got the message inside webview":
        console.log("we have got a message from webview! yeah");
        break;
    }
  },
  render: function() {
    return (
      <View style={styles.container}>
      <WebViewBridge
        ref="webviewbridge"
        onBridgeMessage={this.onBridgeMessage}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
        source={{uri: "https://google.com"}}/>
        <WebViewBridge
        ref="webviewbridge2"
        onBridgeMessage={this.onBridgeMessage}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
        source={require('./test.html')}/>
        </View>
    );
  }
});

module.exports = Sample2;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

