#import "RCTView.h"

@class RCTWKWebView;

/**
 * Special scheme used to pass messages to the injectedJavaScript
 * code without triggering a page load. Usage:
 *
 *   window.location.href = RCTJSNavigationScheme + '://hello'
 */
extern NSString *const RCTJSNavigationScheme;

@protocol RCTWKWebViewDelegate <NSObject>

- (BOOL)webView:(RCTWKWebView *)webView
shouldStartLoadForRequest:(NSMutableDictionary<NSString *, id> *)request
   withCallback:(RCTDirectEventBlock)callback;

@end

@interface RCTWKWebView : RCTView

@property (nonatomic, weak) id<RCTWKWebViewDelegate> delegate;

@property (nonatomic, copy) NSDictionary *source;
@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) BOOL automaticallyAdjustContentInsets;
@property (nonatomic, assign) BOOL sendCookies;
@property (nonatomic, copy) NSString *injectedJavaScript;
@property (nonatomic, copy) NSString *injectedOnStartLoadingJavaScript;

- (void)goForward;
- (void)goBack;
- (void)reload;
- (void)evaluateJavaScript:(NSString *)javaScriptString completionHandler:(void (^)(id, NSError *error))completionHandler;
- (void)sendToBridge:(NSString *)message;

@end
