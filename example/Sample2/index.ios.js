/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var WebViewBridge = require('./WebViewBridge.js');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var Sample2 = React.createClass({
  onNavigationStateChange: function () {
    console.log('onNavigationStateChange is called');
  },
  componentDidMount: function () {
    var bridge = this.refs.bridge;
    bridge.onMessage((value) => {
      console.log('react-native:', value);
      bridge.send(value);
    });
  },
  render: function() {
    var timeStamp = new Date().getTime();
    var url = "http://192.168.1.112:8080?" + timeStamp;//"http://ali.local:8080";
    return (
      <WebViewBridge
        onNavigationStateChange={this.onNavigationStateChange}
        ref="bridge"
        url={url}/>
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
