(function () {
  'use strict'

  var ids = 0
  var invokers = {}
  var responseCallbacks = {}

  //invoker has accept 2 arguments
  //fn(args, result). result is a function which accept an argument.
  //that argument is being used to send to caller as a result value.
  //by using this function, we can support both sync and async operation
  function register(name, fn) {
    invokers[name] = function (id, args) {
      fn(args, function (result) {
        window.WebViewBridge.send({
          id: id,
          type: 'response',
          result: result
        })
      })
    }
  }

  function invoke(name, args, callback) {
    var id = ++ids
    responseCallbacks[id] = callback

    window.WebViewBridge.send({
      id: id,
      type: 'invoke',
      name: name,
      args: args
    })
  }

  function onInvoke(payload) {
    var invoker = invokers[payload.name]
    if (invoker) {
      setTimeout(function () {
        invoker(payload.id, payload.args)
      }, 15)
    }
  }

  function onResponse(payload) {
    var callback = responseCallbacks[payload.id]
    if (callback) {
      delete responseCallbacks[payload.id]
      setTimeout(function () {
        callback(payload.result)
      }, 15)
    }
  }

  function onMessage(payload) {
    if (typeof payload === 'string') {
      return
    }

    //there are two types of payload
    // invoke: { type: 'payload', id, name, args }
    // response: { type: 'response', id, result }

    switch(payload.type) {
      case 'invoke':
        onInvoke(payload)
        break
      case 'response':
        onResponse(payload)
        break
      default:
        //ignore
    }
  }

  //init this method register and attaches rpc to WebViewBridge.
  //you can either check whether WebViewBridge.rpc is availebe or
  //simply register to `webviewbridge:rpc` event.
  function init(WebViewBridge) {
    window.removeEventListener('webviewbridge:init', init)

    var rpc = {
      register: register,
      invoke: invoke
    }

    WebViewBridge.addMessageListener(onMessage)

    WebViewBridge.rpc = rpc
    WebViewBridge.__dispatch__('webviewbridge:rpc', rpc)
  }

  if (window.WebViewBridge) {
    init(window.WebViewBridge)
  } else {
    window.addEventListener('webviewbridge:init', init)
  }
}())
