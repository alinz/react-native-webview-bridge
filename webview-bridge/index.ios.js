/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * Copyright (c) 2016-present, Ali Najafizadeh
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule WebViewBridge
 * @flow
 */
'use strict';

var React = require('react-native');
var invariant = require('invariant');
var keyMirror = require('keymirror');

var {
  ActivityIndicatorIOS,
  EdgeInsetsPropType,
  StyleSheet,
  Text,
  View,
  requireNativeComponent,
  PropTypes,
  UIManager,
  NativeModules: {
    WebViewBridgeManager
  }
} = React;

var BGWASH = 'rgba(255,255,255,0.8)';
var RCT_WEBVIEWBRIDGE_REF = 'webviewbridge';

var RCTWebViewBridgeManager = WebViewBridgeManager;

var WebViewBridgeState = keyMirror({
  IDLE: null,
  LOADING: null,
  ERROR: null,
});

var NavigationType = {
  click: RCTWebViewBridgeManager.NavigationType.LinkClicked,
  formsubmit: RCTWebViewBridgeManager.NavigationType.FormSubmitted,
  backforward: RCTWebViewBridgeManager.NavigationType.BackForward,
  reload: RCTWebViewBridgeManager.NavigationType.Reload,
  formresubmit: RCTWebViewBridgeManager.NavigationType.FormResubmitted,
  other: RCTWebViewBridgeManager.NavigationType.Other,
};

var JSNavigationScheme = RCTWebViewBridgeManager.JSNavigationScheme;

type ErrorEvent = {
  domain: any;
  code: any;
  description: any;
}

type Event = Object;

var defaultRenderLoading = () => (
  <View style={styles.loadingView}>
    <ActivityIndicatorIOS />
  </View>
);
var defaultRenderError = (errorDomain, errorCode, errorDesc) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTextTitle}>
      Error loading page
    </Text>
    <Text style={styles.errorText}>
      {'Domain: ' + errorDomain}
    </Text>
    <Text style={styles.errorText}>
      {'Error Code: ' + errorCode}
    </Text>
    <Text style={styles.errorText}>
      {'Description: ' + errorDesc}
    </Text>
  </View>
);

/**
 * Renders a native WebView.
 */
var WebViewBridge = React.createClass({
  statics: {
    JSNavigationScheme: JSNavigationScheme,
    NavigationType: NavigationType,
  },

  propTypes: {
    ...View.propTypes,
    url: PropTypes.string,
    html: PropTypes.string,
    /**
     * Function that returns a view to show if there's an error.
     */
    renderError: PropTypes.func, // view to show if there's an error
    /**
     * Function that returns a loading indicator.
     */
    renderLoading: PropTypes.func,
    /**
     * Invoked when load finish
     */
    onLoad: PropTypes.func,
    /**
     * Invoked when load either succeeds or fails
     */
    onLoadEnd: PropTypes.func,
    /**
     * Invoked on load start
     */
    onLoadStart: PropTypes.func,
    /**
     * Invoked when load fails
     */
    onError: PropTypes.func,
    /**
     * @platform ios
     */
    bounces: PropTypes.bool,
    /**
     * @platform ios
     */
    scrollEnabled: PropTypes.bool,
    automaticallyAdjustContentInsets: PropTypes.bool,
    contentInset: EdgeInsetsPropType,
    onNavigationStateChange: PropTypes.func,
    startInLoadingState: PropTypes.bool, // force WebView to show loadingView on first load
    style: View.propTypes.style,

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
     * @platform ios
     */
    scalesPageToFit: PropTypes.bool,

    /**
     * Allows custom handling of any webview requests by a JS handler. Return true
     * or false from this method to continue loading the request.
     * @platform ios
     */
    onShouldStartLoadWithRequest: PropTypes.func,

    /**
     * Determines whether HTML5 videos play inline or use the native full-screen
     * controller.
     * default value `false`
     * **NOTE** : "In order for video to play inline, not only does this
     * property need to be set to true, but the video element in the HTML
     * document must also include the webkit-playsinline attribute."
     * @platform ios
     */
    allowsInlineMediaPlayback: PropTypes.bool,

    /**
     * Will be called once the message is being sent from webview
     */
    onBridgeMessage: PropTypes.func,
  },

  getInitialState: function() {
    return {
      viewState: WebViewBridgeState.IDLE,
      lastErrorEvent: (null: ?ErrorEvent),
      startInLoadingState: true,
    };
  },

  componentWillMount: function() {
    if (this.props.startInLoadingState) {
      this.setState({viewState: WebViewBridgeState.LOADING});
    }
  },

  render: function() {
    var otherView = null;

    if (this.state.viewState === WebViewBridgeState.LOADING) {
      otherView = (this.props.renderLoading || defaultRenderLoading)();
    } else if (this.state.viewState === WebViewBridgeState.ERROR) {
      var errorEvent = this.state.lastErrorEvent;
      invariant(
        errorEvent != null,
        'lastErrorEvent expected to be non-null'
      );
      otherView = (this.props.renderError || defaultRenderError)(
        errorEvent.domain,
        errorEvent.code,
        errorEvent.description
      );
    } else if (this.state.viewState !== WebViewBridgeState.IDLE) {
      console.error(
        'RCTWebViewBridge invalid state encountered: ' + this.state.loading
      );
    }

    var webViewStyles = [styles.container, styles.webView, this.props.style];
    if (this.state.viewState === WebViewBridgeState.LOADING ||
      this.state.viewState === WebViewBridgeState.ERROR) {
      // if we're in either LOADING or ERROR states, don't show the webView
      webViewStyles.push(styles.hidden);
    }

    var onShouldStartLoadWithRequest = this.props.onShouldStartLoadWithRequest && ((event: Event) => {
      var shouldStart = this.props.onShouldStartLoadWithRequest &&
        this.props.onShouldStartLoadWithRequest(event.nativeEvent);
      RCTWebViewBridgeManager.startLoadWithResult(!!shouldStart, event.nativeEvent.lockIdentifier);
    });

    var {javaScriptEnabled, domStorageEnabled} = this.props;
    if (this.props.javaScriptEnabledAndroid) {
      console.warn('javaScriptEnabledAndroid is deprecated. Use javaScriptEnabled instead');
      javaScriptEnabled = this.props.javaScriptEnabledAndroid;
    }
    if (this.props.domStorageEnabledAndroid) {
      console.warn('domStorageEnabledAndroid is deprecated. Use domStorageEnabled instead');
      domStorageEnabled = this.props.domStorageEnabledAndroid;
    }

    var onBridgeMessage = (event: Event) => {
      const onBridgeMessageCallback = this.props.onBridgeMessage;
      if (onBridgeMessageCallback) {
        const messages = event.nativeEvent.messages;
        messages.forEach((message) => {
          onBridgeMessageCallback(message);
        });
      }
    };

    var webView =
      <RCTWebViewBridge
        ref={RCT_WEBVIEWBRIDGE_REF}
        key="webViewKey"
        style={webViewStyles}
        url={this.props.url}
        html={this.props.html}
        injectedJavaScript={this.props.injectedJavaScript}
        bounces={this.props.bounces}
        scrollEnabled={this.props.scrollEnabled}
        contentInset={this.props.contentInset}
        automaticallyAdjustContentInsets={this.props.automaticallyAdjustContentInsets}
        onLoadingStart={this.onLoadingStart}
        onLoadingFinish={this.onLoadingFinish}
        onLoadingError={this.onLoadingError}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        scalesPageToFit={this.props.scalesPageToFit}
        allowsInlineMediaPlayback={this.props.allowsInlineMediaPlayback}
        onBridgeMessage={onBridgeMessage}
      />;

    return (
      <View style={styles.container}>
        {webView}
        {otherView}
      </View>
    );
  },

  goForward: function() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewBridgeHandle(),
      UIManager.RCTWebViewBridge.Commands.goForward,
      null
    );
  },

  goBack: function() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewBridgeHandle(),
      UIManager.RCTWebViewBridge.Commands.goBack,
      null
    );
  },

  reload: function() {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewBridgeHandle(),
      UIManager.RCTWebViewBridge.Commands.reload,
      null
    );
  },

  sendToBridge: function (message: string) {
    WebViewBridgeManager.sendToBridge(this.getWebViewBridgeHandle(), message);
  },

  /**
   * We return an event with a bunch of fields including:
   *  url, title, loading, canGoBack, canGoForward
   */
  updateNavigationState: function(event: Event) {
    if (this.props.onNavigationStateChange) {
      this.props.onNavigationStateChange(event.nativeEvent);
    }
  },

  getWebViewBridgeHandle: function(): any {
    return React.findNodeHandle(this.refs[RCT_WEBVIEWBRIDGE_REF]);
  },

  onLoadingStart: function(event: Event) {
    var onLoadStart = this.props.onLoadStart;
    onLoadStart && onLoadStart(event);
    this.updateNavigationState(event);
  },

  onLoadingError: function(event: Event) {
    event.persist(); // persist this event because we need to store it
    var {onError, onLoadEnd} = this.props;
    onError && onError(event);
    onLoadEnd && onLoadEnd(event);
    console.warn('Encountered an error loading page', event.nativeEvent);

    this.setState({
      lastErrorEvent: event.nativeEvent,
      viewState: WebViewBridgeState.ERROR
    });
  },

  onLoadingFinish: function(event: Event) {
    var {onLoad, onLoadEnd} = this.props;
    onLoad && onLoad(event);
    onLoadEnd && onLoadEnd(event);
    this.setState({
      viewState: WebViewBridgeState.IDLE,
    });
    this.updateNavigationState(event);
  },
});

var RCTWebViewBridge = requireNativeComponent('RCTWebViewBridge', WebViewBridge, {
  nativeOnly: {
    onLoadingStart: true,
    onLoadingError: true,
    onLoadingFinish: true,
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BGWASH,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  errorTextTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  hidden: {
    height: 0,
    flex: 0, // disable 'flex:1' when hiding a View
  },
  loadingView: {
    backgroundColor: BGWASH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    backgroundColor: '#ffffff',
  }
});

module.exports = WebViewBridge;
