(function() {
  'use strict';

  var doc = document;
  var WebViewBridge = {};
  var RNWBSchema = "rnwb";
  var queue = [];
  var inProcess = false;
  var customEvent = doc.createEvent('Event');

  function noop() {}

  WebViewBridge = {
    //do not call _fetch directly. this is for internal use
    _fetch: function () {
      var message = JSON.stringify(queue);
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

  window.WebViewBridge = WebViewBridge;

  customEvent.initEvent('WebViewBridge', true, true);
  doc.dispatchEvent(customEvent);
}());
