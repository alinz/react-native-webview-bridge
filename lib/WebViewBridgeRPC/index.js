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
    super(props, context)
    this.bridgeRef = null
    this.rpc = null
  }

  __sender = (payload) => {
    this.bridgeRef.sendToBridge(payload)
  }

  getWebViewRef = () => {
    return this.bridgeRef
  }

  register = (name, fn) => {
    this.rpc.register(this.__sender, name, fn)
  }

  invoke = (name, args, resolve) => {
    this.rpc.invoke(this.__sender, name, args, resolve)
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
        rpc={true}
        onBridgeMessage={(payload) => this.rpc.onMessage(payload)}/>
    )
  }
}
