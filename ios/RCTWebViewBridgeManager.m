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

#import "RCTWebViewBridgeManager.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import "RCTWebViewBridge.h"
#import "UIView+React.h"

@interface RCTWebViewBridgeManager () <RCTWebViewBridgeDelegate>

@end

@implementation RCTWebViewBridgeManager
{
  NSConditionLock *_shouldStartLoadLock;
  BOOL _shouldStartLoad;
}

RCT_EXPORT_MODULE()

- (UIView *)view
{
  RCTWebViewBridge *webView = [RCTWebViewBridge new];
  webView.delegate = self;
  return webView;
}

RCT_EXPORT_VIEW_PROPERTY(source, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(bounces, _webView.scrollView.bounces, BOOL)
RCT_REMAP_VIEW_PROPERTY(scrollEnabled, _webView.scrollView.scrollEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(scalesPageToFit, _webView.scalesPageToFit, BOOL)
RCT_EXPORT_VIEW_PROPERTY(injectedJavaScript, NSString)
RCT_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets)
RCT_EXPORT_VIEW_PROPERTY(automaticallyAdjustContentInsets, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hideKeyboardAccessoryView, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onLoadingStart, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadingFinish, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadingError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onShouldStartLoadWithRequest, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(allowsInlineMediaPlayback, _webView.allowsInlineMediaPlayback, BOOL)
RCT_REMAP_VIEW_PROPERTY(mediaPlaybackRequiresUserAction, _webView.mediaPlaybackRequiresUserAction, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onBridgeMessage, RCTDirectEventBlock)

- (NSDictionary<NSString *, id> *)constantsToExport
{
  return @{
    @"JSNavigationScheme": RCTJSNavigationScheme,
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

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(goBack:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTWebViewBridge *> *viewRegistry) {
    RCTWebViewBridge *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebViewBridge class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebViewBridge, got: %@", view);
    } else {
      [view goBack];
    }
  }];
}

RCT_EXPORT_METHOD(goForward:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTWebViewBridge *> *viewRegistry) {
    RCTWebViewBridge *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebViewBridge class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebViewBridge, got: %@", view);
    } else {
      [view goForward];
    }
  }];
}

RCT_EXPORT_METHOD(reload:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTWebViewBridge *> *viewRegistry) {
    RCTWebViewBridge *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebViewBridge class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebViewBridge, got: %@", view);
    } else {
      [view reload];
    }
  }];
}

RCT_EXPORT_METHOD(sendToBridge:(nonnull NSNumber *)reactTag
                  value:(NSString*)message)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTWebViewBridge *> *viewRegistry) {
    RCTWebViewBridge *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebViewBridge class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebViewBridge, got: %@", view);
    } else {
      [view sendToBridge: message];
    }
  }];
}

#pragma mark - Exported synchronous methods

- (BOOL)webView:(__unused RCTWebViewBridge *)webView
shouldStartLoadForRequest:(NSMutableDictionary<NSString *, id> *)request
   withCallback:(RCTDirectEventBlock)callback
{
  _shouldStartLoadLock = [[NSConditionLock alloc] initWithCondition:arc4random()];
  _shouldStartLoad = YES;
  request[@"lockIdentifier"] = @(_shouldStartLoadLock.condition);
  callback(request);

  // Block the main thread for a maximum of 250ms until the JS thread returns
  if ([_shouldStartLoadLock lockWhenCondition:0 beforeDate:[NSDate dateWithTimeIntervalSinceNow:.25]]) {
    BOOL returnValue = _shouldStartLoad;
    [_shouldStartLoadLock unlock];
    _shouldStartLoadLock = nil;
    return returnValue;
  } else {
    RCTLogWarn(@"Did not receive response to shouldStartLoad in time, defaulting to YES");
    return YES;
  }
}

RCT_EXPORT_METHOD(startLoadWithResult:(BOOL)result lockIdentifier:(NSInteger)lockIdentifier)
{
  if ([_shouldStartLoadLock tryLockWhenCondition:lockIdentifier]) {
    _shouldStartLoad = result;
    [_shouldStartLoadLock unlockWithCondition:0];
  } else {
    RCTLogWarn(@"startLoadWithResult invoked with invalid lockIdentifier: "
               "got %zd, expected %zd", lockIdentifier, _shouldStartLoadLock.condition);
  }
}

@end
