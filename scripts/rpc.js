(function () {
  'use strict'

  var ids = 0
  var invokeFns = {}
  var responseFns = {}

  function registerFn(name, fn) {
    invokeFns[name] = fn
  }

  function invokeFn(name, args, responseFn) {
    var requestId = ++id
    responseFns[requestId] = responseFn

    window.WebViewBridge.send({
      requestId: requestId,
      name: name,
      args: args
    })
  }

  //registeration
  function init(WebViewBridge) {
    window.removeEventListener('webviewbridge:init', init)

    WebViewBridge.rpc = {
      registerFn: registerFn,
      invokeFn: invokeFn
    }

    WebViewBridge.__dispatch__('webviewbridge:rpc', WebViewBridge)
  }

  if (window.WebViewBridge) {
    init(window.WebViewBridge)
  } else {
    window.addEventListener('webviewbridge:init', init)
  }
}())
