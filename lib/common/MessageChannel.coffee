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

EventEmitter = require 'eventemitter3'

class MessageChannel extends EventEmitter

    # Websocket connection's state code
    CONNECTING = 0 # The connection is not yet open.
    OPEN = 1 # The connection is open and ready to communicate.
    CLOSING = 2 # The connection is in the process of closing.
    CLOSED = 3 # The connection is closed or couldn't be opened.

    constructor: (@name, @url) ->
        @wsChannel = null
        @opened = false

    isOpened: ->
        return @opened

    getName: ->
        return @name

    open: (url) ->
        if url
            @url = url
        @wsChannel = @_createWebsocket @url

        @wsChannel.onopen = (event) =>
            @emit 'open', event
        @wsChannel.onclose = (event) =>
            @emit 'close', event
        @wsChannel.onerror = (event) =>
            @emit 'error', event
        @_initOnMessage()

        @opened = true

    _createWebsocket: (url) ->
        return new WebSocket url

    _initOnMessage: ->
        @wsChannel.onmessage = (event) =>
            @emit 'message', event.data

    close: ->
        @opened = false
        @wsChannel?.close()

    send: (data) ->
        if not @opened
            console.warn 'MessageChannel is not opened, cannot sent: ', data
            return
        if not data
            return

        if @wsChannel?.readyState is OPEN # ready
            @wsChannel?.send data
        else if @wsChannel?.readyState is CONNECTING # opening
            setTimeout ( =>
                @send data), 50
        else
            console.error 'MessageChannel send failed, channel readyState is ', @wsChannel.readyState

module.exports = MessageChannel
