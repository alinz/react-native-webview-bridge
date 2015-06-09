/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var WebViewBridge = require('react-native-webview-bridge');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View
} = React;


var htmlContent = `

<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Test Content</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width">
</head>
<body>
  <div id="debug">
    Hello this is a temp page;
  </div>
  <script>

  function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge)
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
            callback(WebViewJavascriptBridge);
        }, false)
    }
  }

  connectWebViewJavascriptBridge(function(bridge) {

    bridge.init(function (message) {
      alert(message);
    });


    alert('send a message from webview');
    bridge.send('Hello from the javascript');
  });

  </script>
</body>
</html>

`;


var WebViewBridgeExample = React.createClass({
  componentDidMount: function () {
    this.refs.myWebView.onMessage((message) => {
      console.log('got a message from webview:', message);

      setTimeout(() => {
        this.refs.myWebView.send("You got it.")
      }, 1000);

    });
  },
  render: function() {
    return (
      <WebViewBridge
        ref="myWebView"
        style={{flex: 1}}
        html={htmlContent}/>
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

AppRegistry.registerComponent('WebViewBridgeExample', () => WebViewBridgeExample);
