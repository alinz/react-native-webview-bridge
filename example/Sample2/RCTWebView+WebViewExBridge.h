//
//  RCTWebView+WebViewBridge.h
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebView.h"
#import "RCTBridgeModule.h"

@interface RCTWebView (WebViewExBridge)

- (void)injectBridgeScript:(NSNumber*)reactTag;

- (void)eval:(NSString *) value;
- (void)bridgeSetup;
- (void)send:(NSString*)message;
- (void)callbackCleanup:(NSNumber *)reactTag;
- (void)onMessageCallback:(RCTResponseSenderBlock)callback withReactTag:(NSNumber *)reactTag;

//we are making this method visible to public. [Can't find any other way]
- (NSMutableDictionary *)baseEvent;

@end
