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

//since category won't let us add variables to class, we need a static map
//to store information about our callbacks. These callbacks can be refereced by reactTag ids.
static NSMutableDictionary * callbackMap;
static dispatch_queue_t serialQueue;

@implementation RCTWebView (WebViewExBridge)

- (void) bridgeSetup {
  static dispatch_once_t onceQueue;

  dispatch_once(&onceQueue, ^{
    callbackMap = [[NSMutableDictionary alloc] init];
    serialQueue = dispatch_queue_create("react-native-webview-bridge", NULL);
  });
}

- (void)send:(NSString*)message {
  UIWebView* _webView = [self valueForKey:@"_webView"];
  NSString *command = [NSString stringWithFormat: @"WebViewBridge.onMessage('%@');", message];
  [_webView stringByEvaluatingJavaScriptFromString:command];
}

- (void) callbackCleanup:(NSNumber *)reactTag {
  [callbackMap removeObjectForKey:reactTag];
}

- (void)onMessageCallback:(RCTResponseSenderBlock)callback withReactTag:(NSNumber *)reactTag {
  dispatch_sync(serialQueue, ^{
    [callbackMap setObject:callback forKeyedSubscript:reactTag];
  });
}

- (void)eval:(NSString *) value {
  //access to provate variable
  UIWebView* _webView = [self valueForKey:@"_webView"];
  [_webView stringByEvaluatingJavaScriptFromString:value];
  NSLog(@"Called Eval %@", value);
}

- (BOOL) isSignalTriggered:(UIWebView *)webView withRequest:(NSURLRequest *)request {
  NSURL *URL = [request URL];
  if ([[URL scheme] isEqualToString:RNWBSchema]) {
    // parse the rest of the URL object and execute functions

    NSString* message = [webView stringByEvaluatingJavaScriptFromString:@"WebViewBridge._fetch()"];

    NSLog(@"%@", message);

    return YES;
  }

  return NO;
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
  //access to provate variable
  RCTEventDispatcher *_eventDispatcher = [self valueForKey:@"_eventDispatcher"];

  //we need to check whether it's coming from our request schema
  if ([self isSignalTriggered:webView withRequest:request]) {
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

- (BOOL)isWebViewBridgeInstantiated:(UIWebView *)webView {
  return [[webView stringByEvaluatingJavaScriptFromString:@"typeof WebViewBridge == 'object'"] isEqualToString:@"true"];
}

- (void)injectBridgeScript:(NSNumber*)reactTag {
  UIWebView* _webView = [self valueForKey:@"_webView"];

  if (![self isWebViewBridgeInstantiated:_webView]) {
    NSBundle *bundle = [NSBundle mainBundle];
    NSString *filePath = [bundle pathForResource:@"webview-bridge-script" ofType:@"js"];
    NSString *handlerId = [NSString stringWithFormat: @"var webViewBridgeHandlerId = %@;", reactTag];
    NSString *js = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
    js = [js stringByReplacingOccurrencesOfString:@"var webViewBridgeHandlerId = 0;"
                                       withString:handlerId];
    [_webView stringByEvaluatingJavaScriptFromString:js];
  }
}

- (NSArray*)__jsonParseArray:(NSString *)messageJSON {
  return [NSJSONSerialization JSONObjectWithData:[messageJSON dataUsingEncoding:NSUTF8StringEncoding]
                                         options:NSJSONReadingAllowFragments
                                           error:nil];
}

- (NSString *)__jsonStringify:(id)message {
  return [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:message
                                                                        options:0
                                                                          error:nil]
                               encoding:NSUTF8StringEncoding];
}

@end
