//
//  MJRWebView.m
//  React-Native-Webview-Bridge
//
//  Created by nagender singh shekhawat on 03/02/18.
//  Copyright © 2018 mojoreads.com. All rights reserved.
//

#import "MJRWebView.h"

@implementation MJRWebView
- (BOOL)canPerformAction:(SEL)action withSender:(id)sender
{
  // Disable every option here, let RCTWebViewBridge handle everything
  return NO;
}
@end
