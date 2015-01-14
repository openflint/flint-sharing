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
ReceiverMessageChannel = require './ReceiverMessageChannel'
MessageChannel = require '../common/MessageChannel'
ReceiverMessageBus = require './ReceiverMessageBus'
FlintConstants = require '../common/FlintConstants'
Peer = require '../peerjs/peer'
PluginLoader = require '../plugin/PluginLoader'

class FlintReceiverManager extends EventEmitter

    constructor: (@appId) ->
        PluginLoader.setItAsReceiver()

        if not @appId
            throw 'illegal APP ID'
        else
            console.info 'FlintReceiverManager appid = ', @appId

        @ipcChannel = null
        @ipcAddress = "ws://127.0.0.1:9431/receiver/" + @appId
        @FlintServerIp = '127.0.0.1'

        @messageChannel = null
        @messageBusList = {}

        @dataPeerId = null
        @mediaPeerId = null

        @cusAdditionalData = null

    open: ->
        if @_isStarted()
            console.warn 'FlintReceiverManager is already opened'
            return

        @ipcChannel = new MessageChannel 'ipc', @ipcAddress
        @ipcChannel.on 'open', (event) =>
            console.log 'ipcChannel opened!!!'
            @_ipcSend
                type: 'register'
            @emit 'open', event

        @ipcChannel.on 'close', (event) =>
            console.log 'ipcChannel closed!!!'
            @ipcChannel = null
            @emit 'close', event

        @ipcChannel.on 'error', (event) =>
            console.error 'ipcChannel error!!!'
            @ipcChannel = null
            @emit 'error', event

        @ipcChannel.on 'message', (data) =>
            try
                console.log 'ipcChannel received message: [', data, ']'
                _data = JSON.parse data
                @_onIpcMessage _data
            catch e
                console.error 'error: ', e

        @ipcChannel.open()

        # open message channel if present
        @messageChannel?.open()

    _onIpcMessage: (data) ->
        switch data.type
            when 'startHeartbeat'
                console.info 'receiver ready to start heartbeat!!!'
            when 'registerok'
                console.info 'receiver register done!!!'
                @FlintServerIp = data['service_info']['ip'][0]
                # uuid = data['service_info']['uuid']
                # device_name = data['service_info']['device_name']
                @_sendAdditionalData()
            when 'heartbeat'
                if data.heartbeat is 'ping'
                    @_ipcSend
                        type: 'heartbeat'
                        heartbeat: 'pong'
                else if data.heartbeat is 'pong'
                    @_ipcSend
                        type: 'heartbeat'
                        heartbeat: 'ping'
                else
                    console.error 'unknow heartbeat message!!!'
            when 'senderconnected'
                @emit 'senderconnected', data.token
                console.info 'IPC senderconnected: ', data.token
            when 'senderdisconnected'
                @emit 'senderdisconnected', data.token
                console.info 'IPC senderdisconnected: ', data.token
            else
                console.error 'IPC unknow type: ', data.type

    setAdditionalData: (additionaldata) ->
        console.info "set custom additionaldata: ", additionaldata
        @cusAdditionalData = additionaldata
        @_sendAdditionalData()

    _sendAdditionalData: ->
        additionalData = @_joinAdditionalData()
        if additionalData
            @_ipcSend
                type: 'additionaldata'
                additionaldata: additionalData
        else
            console.warn 'no additionaldata need to send'

    _joinAdditionalData: ->
        additionalData = {}

        if @messageChannel
            additionalData['channelBaseUrl'] = 'ws://' + @FlintServerIp + ':9439/channels/' + @messageChannel.getName()
        if @dataPeerId
            additionalData['dataPeerId'] = @dataPeerId
        if @mediaPeerId
            additionalData['mediaPeerId'] = @mediaPeerId
        if @cusAdditionalData
            additionalData['customData'] = @cusAdditionalData

        if Object.keys(additionalData).length > 0
            return additionalData
        else
            return null

    close: ->
        if @_isStarted()
            @_ipcSend
                type: 'unregister'
            @messageChannel?.close()
            @messageChannel = null
            @messageBusList = null
            @ipcChannel?.close()
            @ipcChannel = null
        else
            throw 'FlintReceiverManager is not started, cannot close!!!'

    _createMessageChannel: (channelName) ->
        url = 'ws://127.0.0.1:9439/channels/' + channelName
        channel = new ReceiverMessageChannel channelName, url
        channel.on 'open', (event) =>
            console.log 'Receiver default message channel open!!! ', event
        channel.on 'close', (event) =>
            console.log 'Receiver default message channel open!!! ', event
        channel.on 'error', (event) =>
            console.log 'Receiver default message channel open!!! ', event
        return channel

    #
    # for android/iOS senders, don't suggest to use this API if the sender is a web app
    #
    createMessageBus: (namespace) ->
        if not namespace
            namespace = FlintConstants.DEFAULT_NAMESPACE
        if not @messageChannel
            @messageChannel = @_createMessageChannel FlintConstants.DEFAULT_CHANNEL_NAME
#            throw 'createMessageBus failed: default MessageChannel is null'
        messageBus = @_createMessageBus namespace
        return messageBus

    _createMessageBus: (namespace) ->
        messageBus = null
        if @messageBusList[namespace]
            messageBus = @messageBusList[namespace]
        else
            messageBus = new ReceiverMessageBus @messageChannel, namespace
            @messageBusList[namespace] = messageBus
        return messageBus

    createPeer: ->
        peer = new Peer
            host: '127.0.0.1'
            port: '9433'
            secure: false
        return peer

    createDataPeer: ->
        @dataPeerId = null
        peer = new Peer
            host: '127.0.0.1'
            port: '9433'
            secure: false
        peer.on 'open', (peerId) =>
            @dataPeerId = peerId
            @_sendAdditionalData()
        return peer

    createMediaPeer: ->
        @mediaPeerId = null
        peer = new Peer
            host: '127.0.0.1'
            port: '9433'
            secure: false
        peer.on 'open', (peerId) =>
            @mediaPeerId = peerId
            @_sendAdditionalData()
        return peer

    _isStarted: ->
        return @ipcChannel && ipcChannel.isOpened()

    _ipcSend: (message) ->
        message['appid'] = @appId
        data = JSON.stringify message
        @ipcChannel?.send data

module.exports = FlintReceiverManager