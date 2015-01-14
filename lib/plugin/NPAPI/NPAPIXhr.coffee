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

Base64 = require('js-base64').Base64

class NPAPIXhr

    constructor: (@xhrObj) ->

        if not @xhrObj
            throw 'xhrObj cannot be null!!!'

        if not @xhrObj.setOnReadyStateChangeCallback
            throw 'xhrObj is not a NPAPI object'

        _callback = =>
            @readyState = @xhrObj.getReadyState()
            if @readyState is 4
                @readyState = @xhrObj.getReadyState()
                @status = @xhrObj.getStatus()
                respondText = @xhrObj.getResponseText()
                @responseText = Base64.decode respondText
                if @onreadystatechange
                    @onreadystatechange()
        @xhrObj.setOnReadyStateChangeCallback _callback

    send: (data) ->
        if data
            @xhrObj.send data
        else
            @xhrObj.send ''

    open: (method, url) ->
        if (not method) or (not url)
            throw 'method or url is illegal!!!'
        @xhrObj.open method, url

    setRequestHeader: (hKey, hValue) ->
        if (not hKey) or (not hValue)
            throw 'header is illegal!!!'
        @xhrObj.setRequestHeader hKey, hValue

module.exports = NPAPIXhr
