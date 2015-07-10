//
//  RCTWebView+WebViewBridge.m
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebView+WebViewExBridge.h"

@implementation RCTWebView (WebViewExBridge)

- (void)eval:(NSString *) value {
  NSLog(@"Called Eval");
}

@end
