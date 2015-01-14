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

MessageChannel = require '../common/MessageChannel'

class ReceiverMessageChannel extends MessageChannel

    constructor: (name, url) ->
        super name, url
        @senders = {}

    _initOnMessage: ->
        @wsChannel.onmessage = (event) =>
            if not event.data
                return
            try
                data = JSON.parse event.data
                switch data.type
                    when 'senderConnected'
                        @senders[data.senderId] = data.senderId
                        @emit 'senderConnected', data.senderId
                    when 'senderDisconnected'
                        delete @senders[data.senderId]
                        @emit 'senderDisconnected', data.senderId
                    when 'message'
                        @emit 'message', data.data, data.senderId
                    when 'error'
                        @emit 'error', data.message
                    else
                        console.warn 'ReceiverMessageChannel unknow data.type: ', event.data
            catch e
                console.error 'ReceiverMessageChannel on message error: ', e

    send: (data, senderId) ->
        if not data
            return
        if not senderId
            senderId = '*:*'
        message =
            senderId: senderId
            data: data
        super JSON.stringify(message)

    getSenders: ->
        return @senders

module.exports = ReceiverMessageChannel