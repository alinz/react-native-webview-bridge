//
//  RCTWebViewManager+WebViewManager.m
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.

#import "RCTWebViewManager+WebViewManager.h"
#import "RCTBridge.h"
#import "RCTSparseArray.h"
#import "RCTUIManager.h"
#import "RCTWebView.h"
#import "RCTWebView+WebViewBridge.h"

@implementation RCTWebViewManager (WebViewManager)

//NOTE
//DO not include RCT_EXPORT_MODULE() here because RCTWebViewManager already has it and
//we are using category feature in objective-c

RCT_EXPORT_METHOD(bridgeSetup:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    [view setEvetnDispatcher:self.bridge.eventDispatcher];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view bridgeSetup];
  }];
}

RCT_EXPORT_METHOD(callbackCleanup:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view callbackCleanup:reactTag];
  }];
}

RCT_EXPORT_METHOD(onMessage:(nonnull NSNumber *)reactTag
                  withCallback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view onMessageCallback:callback withReactTag:reactTag];
  }];
}

RCT_EXPORT_METHOD(send:(nonnull NSNumber *)reactTag
                  value:(NSString*)message)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view send:message];
  }];
}

RCT_EXPORT_METHOD(eval:(nonnull NSNumber *)reactTag
                 value:(NSString*)value)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view eval:value];
  }];
}

RCT_EXPORT_METHOD(injectBridgeScript:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view injectBridgeScript: reactTag];
  }];
}

RCT_EXPORT_METHOD(print:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view print];
  }];
}

@end
