(function() {
  'use strict';
  var WebViewBridge = {};

  function noop() {}

  WebViewBridge = {
    send: function (value) {
      
    },
    onMessage: noop
  };

  window.WebViewBridge = WebViewBridge;
  var event = document.createEvent('Event');
  event.initEvent('WebViewBridge', true, true);
  document.dispatchEvent(event);
}());
