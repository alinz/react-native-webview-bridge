/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule WebView
 */
'use strict';

import React, { PropTypes } from 'react'
import {
  ActivityIndicator,
  EdgeInsetsPropType,
  StyleSheet,
  Text,
  UIManager,
  View,
  ScrollView,
  NativeModules,
  requireNativeComponent,
  findNodeHandle,
  DeviceEventEmitter
} from 'react-native'

import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import processDecelerationRate from 'react-native/Libraries/Components/ScrollView/processDecelerationRate'
import deprecatedPropType from 'react-native/Libraries/Utilities/deprecatedPropType'

import { encode, decode } from '../core/base64'

const { WebViewBridgeManager } = NativeModules

var RCT_WEBVIEW_REF = 'webview';

var WebViewState = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  ERROR: 'ERROR',
};

var defaultRenderLoading = () => (
  <View style={styles.loadingView}>
    <ActivityIndicator
      style={styles.loadingProgressBar}
    />
  </View>
);

/**
 * Renders a native WebView.
 */
class WebView extends React.Component {
  static propTypes = {
    ...View.propTypes,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    onLoad: PropTypes.func,
    onLoadEnd: PropTypes.func,
    onLoadStart: PropTypes.func,
    onError: PropTypes.func,
    automaticallyAdjustContentInsets: PropTypes.bool,
    contentInset: EdgeInsetsPropType,
    onNavigationStateChange: PropTypes.func,
    onContentSizeChange: PropTypes.func,
    startInLoadingState: PropTypes.bool, // force WebView to show loadingView on first load
    style: View.propTypes.style,

    html: deprecatedPropType(
      PropTypes.string,
      'Use the `source` prop instead.'
    ),

    url: deprecatedPropType(
      PropTypes.string,
      'Use the `source` prop instead.'
    ),

    /**
     * Loads static html or a uri (with optional headers) in the WebView.
     */
    source: PropTypes.oneOfType([
      PropTypes.shape({
        /*
         * The URI to load in the WebView. Can be a local or remote file.
         */
        uri: PropTypes.string,
        /*
         * The HTTP Method to use. Defaults to GET if not specified.
         * NOTE: On Android, only GET and POST are supported.
         */
        method: PropTypes.oneOf(['GET', 'POST']),
        /*
         * Additional HTTP headers to send with the request.
         * NOTE: On Android, this can only be used with GET requests.
         */
        headers: PropTypes.object,
        /*
         * The HTTP body to send with the request. This must be a valid
         * UTF-8 string, and will be sent exactly as specified, with no
         * additional encoding (e.g. URL-escaping or base64) applied.
         * NOTE: On Android, this can only be used with POST requests.
         */
        body: PropTypes.string,
      }),
      PropTypes.shape({
        /*
         * A static HTML page to display in the WebView.
         */
        html: PropTypes.string,
        /*
         * The base URL to be used for any relative links in the HTML.
         */
        baseUrl: PropTypes.string,
      }),
      /*
       * Used internally by packager.
       */
      PropTypes.number,
    ]),

    /**
     * Used on Android only, JS is enabled by default for WebView on iOS
     * @platform android
     */
    javaScriptEnabled: PropTypes.bool,

    /**
     * Used on Android only, controls whether DOM Storage is enabled or not
     * @platform android
     */
    domStorageEnabled: PropTypes.bool,

    /**
     * Sets the JS to be injected when the webpage loads.
     */
    injectedJavaScript: PropTypes.string,

    /**
     * Sets whether the webpage scales to fit the view and the user can change the scale.
     */
    scalesPageToFit: PropTypes.bool,

    /**
     * Sets the user-agent for this WebView. The user-agent can also be set in native using
     * WebViewConfig. This prop will overwrite that config.
     */
    userAgent: PropTypes.string,

    /**
     * Used to locate this view in end-to-end tests.
     */
    testID: PropTypes.string,

    /**
     * Determines whether HTML5 audio & videos require the user to tap before they can
     * start playing. The default value is `false`.
     */
    mediaPlaybackRequiresUserAction: PropTypes.bool,

    allowUniversalAccessFromFileURLs: PropTypes.bool,
    allowFileAccessFromFileURLs: PropTypes.bool,
    onBridgeMessage: PropTypes.func,
    rpc: PropTypes.bool
  };

  static defaultProps = {
    javaScriptEnabled : true,
    scalesPageToFit: true,
  };

  state = {
    viewState: WebViewState.IDLE,
    lastErrorEvent: null,
    startInLoadingState: true,
  };

  componentWillMount() {
    DeviceEventEmitter.addListener('WebViewBridgeMessageEvent', this.onBridgeMessage);

    if (this.props.startInLoadingState) {
      this.setState({viewState: WebViewState.LOADING});
    }
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('WebViewBridgeMessageEvent', this.onBridgeMessage);
  }

  render() {
    var otherView = null;

   if (this.state.viewState === WebViewState.LOADING) {
      otherView = (this.props.renderLoading || defaultRenderLoading)();
    } else if (this.state.viewState === WebViewState.ERROR) {
      var errorEvent = this.state.lastErrorEvent;
      otherView = this.props.renderError && this.props.renderError(
        errorEvent.domain,
        errorEvent.code,
        errorEvent.description);
    } else if (this.state.viewState !== WebViewState.IDLE) {
      console.error('RCTWebViewBridge invalid state encountered: ' + this.state.loading);
    }

    var webViewStyles = [styles.container, this.props.style];
    if (this.state.viewState === WebViewState.LOADING ||
      this.state.viewState === WebViewState.ERROR) {
      // if we're in either LOADING or ERROR states, don't show the webView
      webViewStyles.push(styles.hidden);
    }

    var source = this.props.source || {};
    if (this.props.html) {
      source.html = this.props.html;
    } else if (this.props.url) {
      source.uri = this.props.url;
    }

    if (source.method === 'POST' && source.headers) {
      console.warn('WebView: `source.headers` is not supported when using POST.');
    } else if (source.method === 'GET' && source.body) {
      console.warn('WebView: `source.body` is not supported when using GET.');
    }

    var webView =
      <RCTWebViewBridge
        ref={RCT_WEBVIEW_REF}
        key="webViewKey"
        style={webViewStyles}
        source={resolveAssetSource(source)}
        scalesPageToFit={this.props.scalesPageToFit}
        injectedJavaScript={this.props.injectedJavaScript}
        userAgent={this.props.userAgent}
        javaScriptEnabled={this.props.javaScriptEnabled}
        domStorageEnabled={this.props.domStorageEnabled}
        contentInset={this.props.contentInset}
        automaticallyAdjustContentInsets={this.props.automaticallyAdjustContentInsets}
        onContentSizeChange={this.props.onContentSizeChange}
        onLoadingStart={this.onLoadingStart}
        onLoadingFinish={this.onLoadingFinish}
        onLoadingError={this.onLoadingError}
        testID={this.props.testID}
        mediaPlaybackRequiresUserAction={this.props.mediaPlaybackRequiresUserAction}
        allowFileAccessFromFileURLs={this.props.allowFileAccessFromFileURLs}
        allowUniversalAccessFromFileURLs={this.props.allowUniversalAccessFromFileURLs}
      />;

    return (
      <View style={styles.container}>
        {webView}
        {otherView}
      </View>
    );
  }

  goForward = () => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.goForward,
      null
    );
  };

  goBack = () => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.goBack,
      null
    );
  };

  reload = () => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.reload,
      null
    );
  };

  stopLoading = () => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.stopLoading,
      null
    );
  };

  closeKeyboard = () => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.closeKeyboard,
      null
    );
  };

  /**
   * We return an event with a bunch of fields including:
   *  url, title, loading, canGoBack, canGoForward
   */
  updateNavigationState = (event) => {
    if (this.props.onNavigationStateChange) {
      this.props.onNavigationStateChange(event.nativeEvent);
    }
  };

  onBridgeMessage = (event: Event) => {
    const { onBridgeMessage } = this.props;
    const messages = JSON.parse(event.message)
    if (onBridgeMessage) {
      messages.forEach((message) => {
        onBridgeMessage(decode(message));
      });
    }
  };

  sendToBridge = (message: any) => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.sendToBridge,
      [encode(message)]
    );
  };

  getWebViewHandle = () => {
    return findNodeHandle(this.refs[RCT_WEBVIEW_REF]);
  };

  onLoadingStart = (event) => {
    var onLoadStart = this.props.onLoadStart;
    onLoadStart && onLoadStart(event);
    this.updateNavigationState(event);
  };

  onLoadingError = (event) => {
    event.persist(); // persist this event because we need to store it
    var {onError, onLoadEnd} = this.props;
    onError && onError(event);
    onLoadEnd && onLoadEnd(event);
    console.warn('Encountered an error loading page', event.nativeEvent);

    this.setState({
      lastErrorEvent: event.nativeEvent,
      viewState: WebViewState.ERROR
    });
  };

  onLoadingFinish = (event) => {
    var { onLoad, onLoadEnd, rpc } = this.props;

    //we need to inject WebViewBridge and RPC once the page is loaded
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      UIManager.RCTWebViewBridge.Commands.injectWebViewBridge,
      null
    );

    //check if RPC falg is also on
    if (rpc) {
      UIManager.dispatchViewManagerCommand(
        this.getWebViewHandle(),
        UIManager.RCTWebViewBridge.Commands.injectRPC,
        null
      );
    }

    onLoad && onLoad(event);
    onLoadEnd && onLoadEnd(event);
    this.setState({
      viewState: WebViewState.IDLE,
    });
    this.updateNavigationState(event);
  };
}

var RCTWebViewBridge = requireNativeComponent('RCTWebViewBridge', WebView);

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hidden: {
    height: 0,
    flex: 0, // disable 'flex:1' when hiding a View
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProgressBar: {
    height: 20,
  },
});

module.exports = WebView;
