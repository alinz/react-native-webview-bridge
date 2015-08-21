/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var WebViewBridgeNative = require('react-native-webview-bridge');

var myPageScripts = function() {
  function WebViewBridgeReady(cb) {
    if (window.WebViewBridge) {
      cb(window.WebViewBridge);
      return;
    }
    function handler() {
      document.removeEventListener('WebViewBridge', handler, false);
      cb(window.WebViewBridge);
    }
    document.addEventListener('WebViewBridge', handler, false);
  }
  WebViewBridgeReady(function (WebViewBridge) {
    WebViewBridge.send("Hello this is me calling from web page");
  });
};

//convert function definition into string
myPageScripts = `(${myPageScripts.toString()}());`;

var {
  AppRegistry,
  Component
} = React;

class Sample1 extends Component {
  constructor(props) {
    super(props);
    this.once = true;
  }

  componentDidMount() {
    var myWebViewBridgeRef = this.refs.myWebViewBridge;

    var onMessage = function(message) {
      console.log("Received message", message);
    };
    myWebViewBridgeRef.onMessage(onMessage);

    myWebViewBridgeRef.injectBridgeScript();

    //this opens up the printer window dialoge
    setTimeout(() => {
      myWebViewBridgeRef.print();
    }, 5000);
  }

  onNavigationStateChange(navState) {
    var myWebViewBridgeRef = this.refs.myWebViewBridge;
    if (this.once) {
      this.once = false;
      setTimeout(() => {
        myWebViewBridgeRef.evalScript(myPageScripts);
      }, 1000);
    }

    console.log(navState.url);
  }

  render() {
    var url = 'http://google.com';

    return (
      <WebViewBridgeNative
        ref="myWebViewBridge"
        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
        url={url}
        style={{flex: 1}}/>
    );
  }
}


AppRegistry.registerComponent('Sample1', () => Sample1);
