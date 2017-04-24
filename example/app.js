
import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
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

export default class Sample2 extends Component {
  constructor(props) {
    super(props);
    this.onBridgeMessage = this.onBridgeMessage.bind(this);
  }

  onBridgeMessage(message) {
    switch (message) {
      case "hello from webview":
        this.webviewbridge.sendToBridge("hello from react-native");
        break;
      case "got the message inside webview":
        console.log("we have got a message from webview! yeah");
        break;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <WebViewBridge
          ref={(r) => this.webviewbridge = r}
          onBridgeMessage={this.onBridgeMessage}
          javaScriptEnabled={true}
          injectedJavaScript={injectScript}
          source={{uri: "https://google.com"}}
        />
        <WebViewBridge
        ref="webviewbridge2"
        onBridgeMessage={this.onBridgeMessage}
        javaScriptEnabled={true}
        injectedJavaScript={injectScript}
        source={require('./test.html')}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

