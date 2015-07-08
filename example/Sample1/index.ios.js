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
  WebView
} = React;

var WebViewBridge = require('react-native-webview-bridge');

console.log(WebViewBridge);

var Sample1 = React.createClass({

  componentDidMount: function () {
    //this.refs.myWebView.eval("window.test='cool'");
  },

  onNavigationStateChange: function () {
    console.log('called onNavigationStateChange');
  },

  render: function() {

    var url = "http://yahoo.com";

    return (
      <WebViewBridge
        ref="myWebView"
        onNavigationStateChange={this.onNavigationStateChange}
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

AppRegistry.registerComponent('Sample1', () => Sample1);
