'use strict';

var React = require('react-native');

var {
  WebView,
  NativeModules: {
    WebViewExManager
  }
} = React;

class WebViewBridge extends WebView {
  constructor(props) {
    super(props);
  }

  goForward() {
    WebViewExManager.goForward(this.getWebWiewHandle());
  }

  goBack() {
    WebViewExManager.goBack(this.getWebWiewHandle());
  }

  reload() {
    WebViewExManager.reload(this.getWebWiewHandle());
  }

  onMessage(cb) {
    WebViewExManager.onMessage(this.getWebWiewHandle(), cb);
  }

  eval(value) {
    WebViewExManager.eval(this.getWebWiewHandle(), value);
  }

  send(message) {
    WebViewExManager.send(this.getWebWiewHandle(), message);
  }
}

WebViewBridge.NavigationType = {
  click: WebViewExManager.NavigationType.LinkClicked,
  formsubmit: WebViewExManager.NavigationType.FormSubmitted,
  backforward: WebViewExManager.NavigationType.BackForward,
  reload: WebViewExManager.NavigationType.Reload,
  formresubmit: WebViewExManager.NavigationType.FormResubmitted,
  other: WebViewExManager.NavigationType.Other,
};

module.exports = WebViewBridge;
