/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "WebViewExManager.h"

#import "RCTBridge.h"
#import "RCTSparseArray.h"
#import "RCTUIManager.h"
#import "WebViewEx.h"

@implementation WebViewExManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  return [[WebViewEx alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

RCT_REMAP_VIEW_PROPERTY(url, URL, NSURL);
RCT_REMAP_VIEW_PROPERTY(html, HTML, NSString);
RCT_REMAP_VIEW_PROPERTY(bounces, _webView.scrollView.bounces, BOOL);
RCT_REMAP_VIEW_PROPERTY(scrollEnabled, _webView.scrollView.scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets);
RCT_EXPORT_VIEW_PROPERTY(automaticallyAdjustContentInsets, BOOL);
RCT_EXPORT_VIEW_PROPERTY(shouldInjectAJAXHandler, BOOL);

- (NSDictionary *)constantsToExport
{
  return @{
           @"NavigationType": @{
               @"LinkClicked": @(UIWebViewNavigationTypeLinkClicked),
               @"FormSubmitted": @(UIWebViewNavigationTypeFormSubmitted),
               @"BackForward": @(UIWebViewNavigationTypeBackForward),
               @"Reload": @(UIWebViewNavigationTypeReload),
               @"FormResubmitted": @(UIWebViewNavigationTypeFormResubmitted),
               @"Other": @(UIWebViewNavigationTypeOther)
               },
           };
}

RCT_EXPORT_METHOD(goBack:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    WebViewEx *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[WebViewEx class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view goBack];
  }];
}

RCT_EXPORT_METHOD(goForward:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[WebViewEx class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view goForward];
  }];
}


RCT_EXPORT_METHOD(reload:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    WebViewEx *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[WebViewEx class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view reload];
  }];
}

RCT_EXPORT_METHOD(onMessage:(RCTResponseSenderBlock) callback)
{
  NSLog(@"Called");
}

RCT_EXPORT_METHOD(send:(NSNumber *)reactTag :(id)message)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    WebViewEx *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[WebViewEx class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view send:message];
  }];
}


@end