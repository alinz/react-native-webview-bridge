/**
 * Copyright (c) 2015-present, Ali Najafizadeh.
 * Ali Najafizadeh
 * MIT
 */

#import "WebViewEx.h"

#import <UIKit/UIKit.h>

#import "RCTAutoInsetsProtocol.h"
#import "RCTEventDispatcher.h"
#import "RCTLog.h"
#import "RCTUtils.h"
#import "RCTView.h"
#import "UIView+React.h"

#import "WebViewJavascriptBridge.h"


@implementation WebViewEx
{
  WebViewJavascriptBridge* _bridge;
  RCTResponseSenderBlock _callback;

}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
  self = [super initWithEventDispatcher:eventDispatcher];

  if (self != nil)
  {
    for (UIView *subview in [self subviews])
    {
      if ([subview isKindOfClass: [UIWebView class]])
      {
        _bridge = [WebViewJavascriptBridge bridgeForWebView:(UIWebView *)subview handler:^(id data, WVJBResponseCallback responseCallback) {
          //NSLog(@"Received message from javascript: %@", data);
          _callback(@[data]);
        }];

        break;
      }
    }
  }

  return self;
}

- (void)send:(id)message
{
  [_bridge send:message];
  //_callback(@[message]);
}

- (void)onMessage:(RCTResponseSenderBlock)callback
{
  _callback = callback;
}

@end
