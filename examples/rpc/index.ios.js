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

import { WebViewBridge, WebViewBridgeRPC } from 'react-native-webview-bridge'

const injectScript = `
  (function () {
    if (window.WebViewBridge) {

      WebViewBridge.rpc.invoke('onNativeCall', null, function (resp) {
        alert(resp)
      })

      WebViewBridge.rpc.register('onWebViewCall', function (args, resolve) {
        resolve('this is web call')
      })

      // WebViewBridge.addMessageListener(function (payload) {
      //   alert(payload.message)
      // });
      //
      // WebViewBridge.send({ message: 'This is working' });
    }
  }());
`;

class rpc extends Component {
  constructor(props, context) {
    super(props, context)

    this.bridgeRef = null
  }

  componentDidMount() {
    this.bridgeRef.register('onNativeCall', this.onNativeCall)
  }

  onNativeCall = (args, resolve) => {
    resolve('native call')

    setTimeout(() => {
      console.log('invoking....')
      this.bridgeRef.invoke('onWebViewCall', null, function (resp) {
        console.log(resp)
      })
    }, 3000)
  }

  render() {
    return (
      <WebViewBridgeRPC
        ref={(ref) => this.bridgeRef = ref}
        source={{uri: 'https://github.com/facebook/react-native'}}
        style={{marginTop: 20}}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
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
