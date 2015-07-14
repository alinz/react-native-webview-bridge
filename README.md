# React Native WebView Javascript Bridge
This project is inspired by [WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge).

> In order for me to extend React-Native's WebView, I had to use `Category` feature objective-c, that would be the simplest and most elegant way by far.

## Installation

In order to use this extension, you have to do the following steps:

1. in your react-native project, run `npm install react-native-webview-bridge`
2. go to xcode's `Project Navigator` tab
3. right click on `Libraries`
4. select `Add Files to ...` option
5. navigate to `node_modules/react-native-webview-bridge` and add `WebViewBridge` folder
6. clean compile to make sure your project can compile and build.

## Usage

There is a script which will be injected by this extension to the first page that you load. In order for your webpage to get access to the injected script, you have to use the following function.

```js
function WebViewBridgeReady(cb) {
  //checks whether WebViewBirdge exists in global scope.
  if (window.WebViewBridge) {
    cb(window.WebViewBridge);
    return;
  }

  function handler() {
    //remove the handler from listener since we don't need it anymore
    document.removeEventListener('WebViewBridge', handler, false);
    //pass the WebViewBridge object to the callback
    cb(window.WebViewBridge);
  }

  //if WebViewBridge doesn't exist in global scope attach itself to document
  //event system. Once the code is being injected by extension, the handler will
  //be called.
  document.addEventListener('WebViewBridge', handler, false);
}
```

so now, anywhere in your script in webpage, you can call

```js
WebViewBridgeReady(function (WebViewBridge) {
  //at this time, you should be able to use the injected code here.
});
```

`WebViewBridge` exposes 2 methods, `send` and `onMessage`;

if you want to send a message to `React-Native` component, call the `send` method.

if you want to receive message from `React-Native`, attach a function to `onMessage`.

For Example:

```js
WebViewBridgeReady(function (WebViewBridge) {
  WebViewBridge.onMessage = function(message) {
    console.log('got a message from react-native', message);
  };

  //sending a message to react-native
  WebViewBridge.send("Hello this is me calling from web page");
});
```


On React-Native side, you just have to load the `WebViewBridge` component.

```js
var React = require('react-native');
var WebViewBridge = require('react-native-webview-bridge');
```

Since `WebViewBridge` is extending `WebView` component, it behaves exactly as WebView.
What it means that `WebViewBridge` has all the methods and props of `WebView` component.

So here's an example of using `WebViewBridge`,

```js
var React = require('react-native');
var WebViewBridge = require('react-native-webview-bridge');

var {
  Component
} = React;

var WEBVIEW_REF = 'my_webview';

class MyAwesomeView extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var webviewRef = this.refs[WEBVIEW_REF];

    webviewRef.onMessage(function (message) {
      console.log("This message coming from web view", message);
      webviewRef.send("Hello from react-native");
    });
  }

  render() {
    return (
      <WebViewBridge
        ref={WEBVIEW_REF}
        url="http://<my awesome project url>"
        style={{flex: 1}}
      />
    );
  }
}

```
