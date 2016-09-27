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

      WebViewBridge.addMessageListener(function (payload) {
        alert(payload.message)
      });

      WebViewBridge.send({ message: 'This is working' });
    }
  }());
`;

class rpc extends Component {
  onMessage = (payload) => {
    if (this.bridgeRef) {
      console.log(payload.message)
      this.bridgeRef.sendToBridge({ message: 'This is working too' })
    }
  }

  render() {
    return (
      <WebView
        ref={(ref) => this.bridgeRef = ref}
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
