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

RCT_EXPORT_METHOD(bridgeSetup:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view bridgeSetup];
  }];
}

RCT_EXPORT_METHOD(callbackCleanup:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }

    [view callbackCleanup:reactTag];
  }];
}

RCT_EXPORT_METHOD(onMessage:(NSNumber *)reactTag
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

RCT_EXPORT_METHOD(send:(NSNumber *)reactTag
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

RCT_EXPORT_METHOD(eval:(NSNumber *)reactTag
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

RCT_EXPORT_METHOD(injectBridgeScript:(NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTWebView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RCTWebView class]]) {
      RCTLogMustFix(@"Invalid view returned from registry, expecting RKWebView, got: %@", view);
    }
    [view injectBridgeScript: reactTag];
  }];
}


@end
