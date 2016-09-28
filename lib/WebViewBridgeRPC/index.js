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

  sender = (payload) => {
    this.bridgeRef.sendToBridge(payload)
  }

  getWebViewRef = () => {
    return this.bridgeRef
  }

  register = (name, fn) => {
    this.rpc.register(this.sender, name, fn)
  }

  invoke = (name, args, resolve) => {
    this.rpc.invoke(this.sender, name, args, resolve)
  }

  onMessage = (payload) => {
    this.rpc.onMessage(payload)
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
        onBridgeMessage={this.onMessage}/>
    )
  }
}
