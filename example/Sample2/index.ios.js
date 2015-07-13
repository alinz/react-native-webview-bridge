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
  componentDidMount: function () {
    //this.refs.ali.evalScript('window.alert("Booya!")');
  },
  render: function() {
    var url = "http://google.com";
    return (
      <WebViewBridge ref="ali" url={url}/>
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
