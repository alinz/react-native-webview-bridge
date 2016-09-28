/**
 * Copyright (c) 2016-present, Ali Najafizadeh
 * All rights reserved.
 *
 * @providesModule WebViewBridgeRPC
 * @noflow
 */
import React, { Component } from 'react'

import WebViewBridge from '../WebViewBridge'
import rpc from '../core/rpc'

export default class WebViewBridgeRPC extends Component {
  constructor(props, context) {
    this.bridgeRef = null
    this.rpc = null
  }

  getWebViewRef = () => {
    return this.bridgeRef
  }

  register = (name, fn) => {
    this.rpc.register(name, fn)
  }

  invoke = (name, args) => {
    //for now we don't care about reject.
    //TODO: reject can be implemeneted by introducing timeout and failer in result.
    //for now we don't support it.
    return new Promise((resolve, reject) => {
      this.rpc.invoke(name, args, resolve)
    })
  }

  componentDidMount() {
    this.rpc = rpc()
  }

  componentWillMount() {
    this.rpc = null
  }

  render() {
    return (
      <WebViewBridge
        {...this.props}
        ref={(ref) => this.bridgeRef = ref}
        injectRPC={true}/>
    )
  }
}
