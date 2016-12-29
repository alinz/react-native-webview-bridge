#import <Foundation/Foundation.h>
#import "WVURLConnection.h"

@implementation WVURLConnection

// This method is used to receive the data which we get using post method.
- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData*)data
{
    NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    NSString *trimmedResponse = [response stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    
    NSString *format = @"httpCallback('%@', '%@');";
    
    NSString *command = [NSString stringWithFormat: format, self.callbackId, trimmedResponse];
    [self.webView evaluateJavaScript:command completionHandler:nil];
}

// This method receives the error report in case of connection is not made to server.
- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
}

// This method is used to process the data after connection has made successfully.
- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
}

@end
