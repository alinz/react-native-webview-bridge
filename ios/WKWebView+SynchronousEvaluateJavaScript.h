//
//  WKWebView+ SynchronousEvaluateJavaScript.h
//  React-Native-Webview-Bridge
//
//  Created by Guy Eldar on 26/11/2019.
//  Copyright © 2019 alinz. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@interface WKWebView(SynchronousEvaluateJavaScript)
- (NSString *)stringByEvaluatingJavaScriptFromString:(NSString *)script;
@end
