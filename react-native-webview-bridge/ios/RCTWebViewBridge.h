/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * Copyright (c) 2015-present, Ali Najafizadeh (github.com/alinz)
 * All rights reserved
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <React/RCTView.h>

@class RCTWebViewBridge;

/**
 * Special scheme used to pass messages to the injectedJavaScript
 * code without triggering a page load. Usage:
 *
 *   window.location.href = RCTJSNavigationScheme + '://hello'
 */
extern NSString *const RCTJSNavigationScheme;

@protocol RCTWebViewBridgeDelegate <NSObject>

- (BOOL)webView:(RCTWebViewBridge *)webView
shouldStartLoadForRequest:(NSMutableDictionary<NSString *, id> *)request
   withCallback:(RCTDirectEventBlock)callback;

@end

@interface RCTWebViewBridge : RCTView

@property (nonatomic, weak) id<RCTWebViewBridgeDelegate> delegate;

@property (nonatomic, copy) NSDictionary *source;
@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) BOOL automaticallyAdjustContentInsets;
@property (nonatomic, assign) BOOL hideKeyboardAccessoryView;
@property (nonatomic, copy) NSString *injectedJavaScript;

- (void)goForward;
- (void)goBack;
- (void)reload;
- (void)sendToBridge:(NSString *)message;

@end
