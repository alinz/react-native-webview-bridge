# React Native WebView Javascript Bridge

This is an experimental version 2 of this module. *at the moment, it does not work with RNPM*

## Installation

- run `npm install react-native-webview-bridge`
- add both `scripts/WebViewBridge.js` and `scripts/WebViewBridgeRPC.js` into your xcode project

## V2

I initially created this module so I can communicate from react-native to webview's script and by default react-native's webview
does have a way for achiving this feature. As times went by I found myself writing the proper communication code over and over again on top of it. So I have decided to make it one of the core feature of bridge by brining RPC into the table.

This will be the first initial of RPC, as you can easily call either react-native and webview function from either side.

## RPC

You have to 2 things, in order to make the RPC work. First, adding the file `scripts/WebViewBridgeRPC.js` to your project along side of `scripts/WebViewBridge.js`. These two file will be injected into every WebView instance you create.
Second instead of using `import { WebViewBridge } from 'react-native-webview-bridge'`, you have to use `import { WebViewBridgeRPC } from 'react-native-webview-bridge'`. `WebViewBridgeRPC` is exactly the same as `WebViewBridge` but it will manage all the communication via RPC calls.

## APIs

#### WebViewBridge

#### Props
- onBridgeMessage(fn: Function)

accept a function as an argument and it will call it once a new message coming from WebView's script.

```javascript
onBridgeMessage(function (payload) {
  console.log('got this payload', payload)
})
```

##### Methods
- sendToBridge(payload: string|object)

```javascript
this.webViewRef.sendToBridge('hello world')
//or
this.webViewRef.sendToBridge({ message: 'hello world' })
```

accept either `string` or `object` and it will send it to `WebView`'s script

> Note: you do not need to escape any character as the underneath transportation is using base64.

#### WebViewBridgeRPC

##### Methods

- register(name: string, fn: Function(resolve: Function, reject: Function))
- invoke(name: string, args: any, opt: { timeout: 0}, fn: Function(err: any, result: any))
