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
console.log(WebViewBridge);

var Sample2 = React.createClass({
  componentDidMount() {
    setTimeout(() => {
      this.refs.webviewbridge.sendToBridge("hahaha");
    }, 5000);
  },
  render: function() {
    return (
      <WebViewBridge
        ref="webviewbridge"
        onBridgeMessage={(message) => {
          console.log(message);
        }}
        url={"http://google.com"}/>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('Sample2', () => Sample2);
