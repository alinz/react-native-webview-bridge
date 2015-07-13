//
//  RCTWebView+WebViewBridge.h
//  Sample2
//
//  Created by Ali Najafizadeh on 2015-07-10.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebView.h"

@interface RCTWebView (WebViewExBridge)
- (void)eval:(NSString *) value;

//in this category I'm going to make this mothod visible.
- (NSMutableDictionary *)baseEvent;
@end
