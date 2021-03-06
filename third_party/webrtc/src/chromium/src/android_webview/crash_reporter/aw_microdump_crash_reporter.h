// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef ANDROID_WEBVIEW_CRASH_REPORTER_AW_MICRODUMP_CRASH_REPORTER_H_
#define ANDROID_WEBVIEW_CRASH_REPORTER_AW_MICRODUMP_CRASH_REPORTER_H_

#include <string>

namespace android_webview {
namespace crash_reporter {

void EnableMicrodumpCrashReporter();
void AddGpuFingerprintToMicrodumpCrashHandler(
    const std::string& gpu_fingerprint);

}  // namespace crash_reporter
}  // namespace android_webview

#endif  // ANDROID_WEBVIEW_CRASH_REPORTER_AW_MICRODUMP_CRASH_REPORTER_H_
