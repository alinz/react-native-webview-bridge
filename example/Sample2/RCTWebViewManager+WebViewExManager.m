//
//  RCTWebViewManager+WebViewExManager.m
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebViewManager+WebViewExManager.h"
#import "RCTBridge.h"
#import "RCTSparseArray.h"
#import "RCTUIManager.h"
#import "RCTWebView.h"
#import "RCTWebView+WebViewExBridge.h"

@implementation RCTWebViewManager (WebViewExManager)


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


@end
