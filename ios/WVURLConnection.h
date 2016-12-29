#import <WebKit/WebKit.h>

@interface WVURLConnection: NSObject

@property NSString *callbackId;
@property WKWebView *webView;

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData*)data;
- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error;
- (void)connectionDidFinishLoading:(NSURLConnection *)connection;

@end
