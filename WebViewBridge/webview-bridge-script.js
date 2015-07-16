(function() {
  'use strict';

  //this variable will be set during the injection by objective-c
  //we need to know the handlerId in order to locate the callback properly.
  var webViewBridgeHandlerId = 0;

  var doc = document;
  var WebViewBridge = {};
  var RNWBSchema = "rnwb";
  var queue = [];
  var inProcess = false;
  var customEvent;

  function noop() {}

  WebViewBridge = {
    init: noop,
    //do not call _fetch directly. this is for internal use
    _fetch: function () {
      var message;
      queue.unshift(webViewBridgeHandlerId);
      message = JSON.stringify(queue);
      queue = [];
      inProcess = false;
      return message;
    },
    send: function (value) {
      queue.push(value);
      if (!inProcess) {
        inProcess = true;
        //signal the objective-c that there is a message in the queue
        window.location = RNWBSchema + '://message' + new Date().getTime();
      }
    },
    onMessage: noop
  };

  window.WebViewJavascriptBridge = WebViewBridge;
  window.WebViewBridge = WebViewBridge;

  doc.dispatchEvent(
    new CustomEvent("WebViewJavascriptBridgeReady", { bubbles: true, cancelable: true })
  );
}());
