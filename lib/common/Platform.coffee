#
# Copyright (C) 2013-2014, The OpenFlint Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

BrowserDetect = require './BrowserDetect'

class Platform
    @detector = null

    @getPlatform: ->
        if not Platform.detector
            Platform.detector = new BrowserDetect()
            Platform.detector.init()
            if Platform.detector.browser.toLowerCase() is 'firefox'
                if window.MozActivity isnt undefined
                    Platform.detector.browser = 'ffos'

        platform =
            browser: Platform.detector.browser.toLowerCase()
            version: Platform.detector.version.toLowerCase()
            os: Platform.detector.OS.toLowerCase()

        return platform

module.exports = Platform
