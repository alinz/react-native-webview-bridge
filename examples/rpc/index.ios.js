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

      WebViewBridge.addMessageListener(function (message) {
        alert(message)
      });

      WebViewBridge.send({ message: 'This is working' });
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
