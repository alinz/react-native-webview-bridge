/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * Copyright (c) 2015-present, Ali Najafizadeh (github.com/alinz)
 * All rights reserved
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

 #if __has_include(<React/RCTViewManager.h>)
 #import <React/RCTViewManager.h>
 #elif __has_include("RCTViewManager.h")
 #import "RCTViewManager.h"
 #else
 #import "React/RCTViewManager.h"
 #endif

@interface RCTWebViewBridgeManager : RCTViewManager

@end
