(function () {
  var WebViewBridge = window.WebViewBridge ? window.WebViewBridge : {}
  var queue = []
  var onMessageListeners = {}

  //base64 encode and decode polyfil
  //modified version of https://github.com/davidchambers/Base64.js
  //you can replace the b64Encode and b64Decode for atob and btoa.
  var b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  function b64Encode(input) {
    var output = ''
    for (
      var block, charCode, idx = 0, map = b64ch;
      input.charAt(idx | 0) || (map = '=', idx % 1);
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4)
      block = block << 8 | charCode
    }
    return output
  }

  function b64Decode(input) {
    var str = input.replace(/=+$/, '')
    var output = ''
    for (
      var bc = 0, bs, buffer, idx = 0;
      buffer = str.charAt(idx++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = b64ch.indexOf(buffer)
    }
    return output
  }

  function encode(input) {
    if (typeof input !== 'string') {
      try {
        input = JSON.stringify(input)
      } catch(e) {}
    }
    input = unescape(encodeURIComponent(input))
    return b64Encode(input)
  }

  function decode(input) {
    var result = decodeURIComponent(escape(b64Decode(input)))
    try {
      result = JSON.parse(result)
    } catch(e){}
    return result
  }

  function signalNative() {
    if (WebViewBridge.nativeAndroidSend) {
      WebViewBridge.nativeAndroidSend(WebViewBridge.__fetch__())
    } else {
      window.location = 'rnwb://message' + new Date().getTime()
    }
  }

  function dispatch(name, value) {
    var event
    try {
      event = new CustomEvent(name, {
        detail: value,
        bubbles: true
      });
    } catch (e) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(name, true, true, {
        detail: value,
        bubbles: true
      });
    }


    setTimeout(function () {
      window.document.dispatchEvent(event)
    }, 15)
  }

  WebViewBridge.__dispatch__ = dispatch
  WebViewBridge.__push__ = function (encoded) {
    //we need to release native caller as soon as possible
    //that's why we are wrap this on setTimeout
    setTimeout(function () {
      var fn = null
      var decoded = decode(encoded)
      Object.keys(onMessageListeners).forEach(function (onMessage) {
        fn = onMessageListeners[onMessage]
        fn(decoded)
      })
    }, 15)
  }
  WebViewBridge.__fetch__ = function () {
    var val = JSON.stringify(queue)
    queue = []
    return val
  }
  WebViewBridge.send = function (input) {
    queue.push(encode(input))
    setTimeout(signalNative, 15)
  }
  WebViewBridge.addMessageListener = function(fn) {
    onMessageListeners[fn] = fn
  }
  WebViewBridge.removeMessageListener = function (fn) {
    delete onMessageListeners[fn]
  }

  window.WebViewBridge = WebViewBridge
  dispatch('webviewbridge:init', WebViewBridge)
}())
