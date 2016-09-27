/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import WebView from 'react-native-webview-bridge'

const injectScript = `
  (function () {
    if (window.WebViewBridge) {

      WebViewBridge.onMessage = function (message) {
        if (message === "hello from react-native") {
          WebViewBridge.send("got the message inside webview");
        }
      };

      WebViewBridge.send({ message: 'nice to see you' });
    }
  }());
`;

class rpc extends Component {
  onMessage = (payload) => {
    console.log(payload.message)
  }
  render() {
    console.log(injectScript)
    return (
      <WebView
        source={{uri: 'https://github.com/facebook/react-native'}}
        style={{marginTop: 20}}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
        onBridgeMessage={this.onMessage}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('rpc', () => rpc);
