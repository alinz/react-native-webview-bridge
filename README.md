# React Native WebView Javascript Bridge
This is an attempt to create a Javascript Bridge between React Native and Webview.

> In order for me to port [WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge) to React Native, I had to extends WebView component provided by Facebook. I wanted a feature like `send` and `onMessage` to communicate between React-Native Components and Web View content.

## Installation

In order to use this frame work you have to do couple of simple step.

1. run `npm install react-natve-webview-bridge`
2. go to `Project Navigator` tab in xcode
3. right click on `Libraries`
4. select `Add Files to ...` option
5. navigate to `node_modules/react-native-webview-bridge` and add `WebViewBridge` folder
6. clean compile to make sure your project can compile and build.

## Usage

In order for WebView's javascript communicates to React-Native, you have to add couple of function into your existing web app.

```html
<html>
  <head>
    <title>My Awesome Web App</title>
  </head>

  <body>
    <script>
      var myBridge = null;

      //whenever react native component sends a message to WebView,
      //this callback is called.
      function onMessage(message) {
        console.log('This message coming from react-native', message);
      }

      //if the bridge is established, you can use this function to send
      //a message to react native code.
      function send(message) {
        if (myBridge) {
          myBridge.send(message);
        }
      }


      //this function register a callback into inject code in webview
      //and once the bridge is ready, it  will pass the bridge ref to the
      //callback
      function connectWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(WebViewJavascriptBridge)
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                callback(WebViewJavascriptBridge);
            }, false)
        }
      }

      connectWebViewJavascriptBridge(function (bridge) {
        myBridge = bridge;
        bridge.init(onMessage);

        //you can call any other function here to notify that
        //bridge is connected and ready to be used.
      });
    </script>
  </body>
</html>
```


on React Native side, instead of using `WebView` component, use the following one.

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

      setTimeout(function () {
        webviewRef.send("Hello from react-native");
      }, 1000);
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

### WebViewBridge
`WebViewBridge` extends 'WebView' so you can have all the available feature of `WebView`. I have just added 2 methods

#### send(message)

#### onMessage(callback)

## Thanks
Thanks to @marcuswestin for amazing [WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge) library.
