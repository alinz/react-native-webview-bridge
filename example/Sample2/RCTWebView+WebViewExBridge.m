//
//  RCTWebView+WebViewBridge.m
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebView+WebViewExBridge.h"
#import "RCTEventDispatcher.h"

static NSString *const RCTJSAJAXScheme = @"react-ajax";
static NSString *const RNWBSchema = @"rnwb";

@implementation RCTWebView (WebViewExBridge)


- (void)eval:(NSString *) value {
  //access to provate variable
  UIWebView* _webView = [self valueForKey:@"_webView"];
  [_webView stringByEvaluatingJavaScriptFromString:value];
  NSLog(@"Called Eval %@", value);
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
 //access to provate variable
 RCTEventDispatcher *_eventDispatcher = [self valueForKey:@"_eventDispatcher"];

 //we need to check whether it's coming from our request schema
 NSURL *URL = [request URL];
 if ([[URL scheme] isEqualToString:RNWBSchema]) {
   // parse the rest of the URL object and execute functions

   NSString* message = [webView stringByEvaluatingJavaScriptFromString:@"WebViewBridge._fetch()"];

   NSLog(@"%@", message);

   return NO;
 }

 // We have this check to filter out iframe requests and whatnot
 BOOL isTopFrame = [request.URL isEqual:request.mainDocumentURL];
 if (isTopFrame) {
   NSMutableDictionary *event = [self baseEvent];
   [event addEntriesFromDictionary: @{
                                      @"url": [request.URL absoluteString],
                                      @"navigationType": @(navigationType)
                                      }];
   [_eventDispatcher sendInputEventWithName:@"topLoadingStart" body:event];
 }

 // AJAX handler
 return ![request.URL.scheme isEqualToString:RCTJSAJAXScheme];
}

- (void)injectBridgeScript {
  UIWebView* _webView = [self valueForKey:@"_webView"];
  if (![[_webView stringByEvaluatingJavaScriptFromString:@"typeof WebViewJavascriptBridge == 'object'"] isEqualToString:@"true"]) {
    NSBundle *bundle = [NSBundle mainBundle];
    NSString *filePath = [bundle pathForResource:@"webview-bridge-script" ofType:@"js"];
    NSString *js = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
    [_webView stringByEvaluatingJavaScriptFromString:js];
  }
}

@end
