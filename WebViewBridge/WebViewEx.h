/**
 * Copyright (c) 2015-present, Ali Najafizadeh.
 * Ali Najafizadeh
 * MIT
 */

#import "RCTWebView.h"
#import "RCTBridge.h"

@class RCTEventDispatcher;

@interface WebViewEx : RCTWebView

- (void)send:(id)message;
- (void)onMessage:(RCTResponseSenderBlock)callback;

@end
