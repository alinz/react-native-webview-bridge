/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { WebViewBridge, WebViewBridgeRPC } from 'react-native-webview-bridge'

const injectScript = `
  (function () {
    if (window.WebViewBridge && window.WebViewBridge.rpc) {
      var rpc = WebViewBridge.rpc

      rpc.invoke('onNativeCall', null, { timeout: 0 }, function (err, resp) {
        alert(resp)
      })

      rpc.register('onWebViewCall', function (args, resolve, reject) {
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

export default class app extends Component {
  constructor(props, context) {
    super(props, context)

    this.bridgeRef = null
  }

  componentDidMount() {
    this.bridgeRef.register('onNativeCall', this.onNativeCall)
  }

  onNativeCall = (args, resolve, reject) => {
    resolve('native call')

    setTimeout(() => {
      this.bridgeRef.invoke('onWebViewCall', null, { timeout: 0 }, function (err, resp) {
        console.log(err, resp)
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
