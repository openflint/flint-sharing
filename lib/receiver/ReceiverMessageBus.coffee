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

MessageBus = require '../common/MessageBus'

class ReceiverMessageBus extends MessageBus

    constructor: (channel, namespace) ->
        super channel, namespace

    _init: ->
        @channel.on 'senderConnected', (senderId) =>
            @emit 'senderConnected', senderId
        @channel.on 'senderDisconnected', (senderId) =>
            @emit 'senderDisconnected', senderId
        @channel.on 'message', (message, senderId) =>
            try
                data = JSON.parse message
                if data.namespace is @namespace
                    @emit 'message', data.payload, senderId
            catch e
                return

    send: (data, senderId) ->
        if not data
            return
        if not senderId
            senderId = '*:*'
        message =
            namespace: @namespace
            payload: data
        @channel.send JSON.stringify(message), senderId

    getSenders: ->
        return @channel.getSenders()

module.exports = ReceiverMessageBus