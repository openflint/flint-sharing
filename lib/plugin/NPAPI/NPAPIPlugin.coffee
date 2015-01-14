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

NPAPIXhr = require './NPAPIXhr'
NPAPIWs = require './NPAPIWs'
NPAPISSDPResponder = require './NPAPISSDPResponder'

class NPAPIPlugin

    PLUGIN_NAME = 'flintplugin'
    PLUGIN_MIME_TYPE = 'application/x-flintplugin'

    constructor: (@isReciever) ->
        @plugin = null
        len = navigator.mimeTypes.length
        i = 0
        while i < len
            if navigator.mimeTypes[i].type is PLUGIN_MIME_TYPE
                console.log 'create NPAPI plugin'
                plugin = document.createElement 'object'
                plugin.setAttribute 'type', PLUGIN_MIME_TYPE
                plugin.setAttribute 'style', 'width: 0; height: 0;'
                document.documentElement.appendChild plugin
                window[PLUGIN_NAME] = plugin
                @plugin = plugin
                break
            i += 1

        if not @plugin
            throw 'cannot load NPAPI plugin: ' + PLUGIN_NAME

    createWebSocket: (url) ->
        if @isReciever
            return new WebSocket(url)
        else
            console.log 'create NPAPI websocket: ', url
            wsObj = @plugin.createWebSocket url
            return new NPAPIWs(wsObj, url)

    createXMLHttpRequest: ->
        if @isReciever
            return new XMLHttpRequest()
        else
            console.log 'create NPAPI XMLHttpRequest: '
            xhrObj = @plugin.createXMLHttpRequest()
            return new NPAPIXhr(xhrObj)

    createSSDPResponder: (options) ->
        # TODO:
        # method:
        #   start()
        #   stop()
        #   seartch(searchTarget)
        # event:
        #   'serviceFound', device-desc url
        #   'serviceLost': device-desc url
        ssdpResponder = @plugin.createSSDPResponder()
        return new NPAPISSDPResponder(ssdpResponder)

    createMDNSResponder: (options) ->
        throw 'Not Implemented'

module.exports = NPAPIPlugin
