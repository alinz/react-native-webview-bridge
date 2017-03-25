/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebViewBridge from 'react-native-webview-bridge';

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

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default class Sample2 extends Component {
  constructor(props) {
    super(props);
    this.webviewbridge = null;
    this.onBridgeMessage = this.onBridgeMessage.bind(this);
  }

  onBridgeMessage(message) {
    if (!this.webviewbridge) {
      return;
    }

    switch (message) {
      case "hello from webview":
        this.webviewbridge.sendToBridge("hello from react-native");
        break;
      case "got the message inside webview":
        console.log("we have got a message from webview! yeah");
        break;
    }
  }

// {
// '_targetInst',
// 'isDefaultPrevented',
// 'isPropagationStopped',
// '_dispatchListeners',
// '_dispatchInstances',
// 'nativeEvent',
// 'type',
// 'target',
// 'currentTarget',
// 'eventPhase',
// 'bubbles',
// 'cancelable',
// 'timeStamp',
// 'defaultPrevented',
// 'isTrusted'
// }

  render() {
    return (
      <View style={styles.container}>
        <WebViewBridge
          onLoad={(event) => { console.log('webview onLoad', event.nativeEvent); }}
          onLoadStart={(event) => { console.log('webview onLoadStart', event.nativeEvent); }}
          onLoadEnd={(event) => { console.log('webview onLoadEnd', event.nativeEvent); }}
          javaScriptEnabled
          source={{uri: "https://google.com"}}/>
        <WebViewBridge
          ref={(webviewbridge) => { this.webviewbridge = webviewbridge }}
          onBridgeMessage={this.onBridgeMessage}
          injectedJavaScript={injectScript}
          onLoad={(event) => { console.log('webview2 onLoad', event.nativeEvent); }}
          onLoadStart={(event) => { console.log('webview2 onLoadStart', event.nativeEvent); }}
          onLoadEnd={(event) => { console.log('webview2 onLoadEnd', event.nativeEvent); }}
          javaScriptEnabled
          scalesPageToFit
          source={require('./test.html')}/>
      </View>
    );
  }
}
