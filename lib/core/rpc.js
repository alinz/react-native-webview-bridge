/**
 * Copyright (c) 2016-present, Ali Najafizadeh
 * All rights reserved.
 */
function rpc() {
  var ids = 0
  var invokers = {}
  var responseCallbacks = {}

  //invoker has accept 2 arguments
  //fn(args, result). result is a function which accept an argument.
  //that argument is being used to send to caller as a result value.
  //by using this function, we can support both sync and async operation
  function register(sender, name, fn) {
    invokers[name] = function (id, args) {
      fn(args, function (result) {
        sender({
          id: id,
          type: 'response',
          result: result
        })
      })
    }
  }

  function invoke(sender, name, args, callback) {
    var id = ++ids
    responseCallbacks[id] = callback

    sender({
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

    // there are two types of payload
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

  return {
    register: register,
    invoke: invoke,
    onMessage: onMessage
  }
}

module.exports = rpc
