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
FlintDevice = require './FlintDevice'
SSDPManager = require '../discovery/ssdp/SSDPManager'
MDNSManager = require '../discovery/mdns/MDNSManager'

class FlintDeviceScanner extends EventEmitter

    INTERVAL = 10 * 1000

    constructor: ->
        @devices = {}

        @ssdpManager = null
        @mdnsManager = null

        @_init()

    _init: ->
        @_initSSDP()
        @_initmDns()

    _initSSDP: ->
        console.info 'init SSDPManager'
        @ssdpManager = new SSDPManager()
        @ssdpManager.on 'adddevice', (device) =>
            @_addDevice device
        @ssdpManager.on 'removedevice', (uniqueId) =>
            @_removeDevice uniqueId

    _initmDns: ->
        console.info 'init MDNSManager'
        @mdnsManager = new SSDPManager()
        @mdnsManager.on 'adddevice', (device) =>
            @_addDevice device
        @mdnsManager.on 'removedevice', (uniqueId) =>
            @_removeDevice uniqueId

    _addDevice: (device) ->
        uniqueId = device.getUniqueId()
        if not @devices[uniqueId]
            console.log 'found device: ', device.getName()
            @devices[uniqueId] = device
            device.on 'devicetimeout', (_uniqueId) =>
                @_removeDevice _uniqueId
            @emit 'devicefound', device

    _removeDevice: (uniqueId) ->
        if @devices[uniqueId]
            console.warn 'found device: ', @devices[uniqueId].getName()
            @emit 'devicegone', @devices[uniqueId]
            delete @devices[uniqueId]

    start: ->
        @ssdpManager?.start()
        @mdnsManager?.start()

    stop: ->
        @ssdpManager?.stop()
        @mdnsManager?.stop()

    getDeviceList: ->
        dList = []
        for _, value of @devices
            dList.push value
        return dList

module.exports = FlintDeviceScanner
