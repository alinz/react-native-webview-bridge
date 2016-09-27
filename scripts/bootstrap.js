(function () {
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

  // event section
  var doc = window.document

  function signalNative() {
    window.location = 'rnwb://message' + new Date().getTime()
  }

  function dispatch(name, value) {
    var event = new CustomEvent(name, {
      detail: value,
      bubbles: true
    });

    setTimeout(function () {
      doc.dispatchEvent(event)
    }, 15)
  }

  var queue = []

  window.WebViewBridge = {
    __push__: function (encoded) {
      decoded = decode(encoded)
      //dispatch('webviewbridge:message', decoded);
      window.WebViewBridge.message(decoded)
    },
    __fetch__: function () {
      var val = JSON.stringify(queue)
      queue = []
      return val
    },
    send: function (input) {
      queue.push(encode(input))
      setTimeout(signalNative, 15)
    },
    onMessage: function(msg) {}
  }

  dispatch('webviewbridge:init', window.WebViewBridge)
}())
