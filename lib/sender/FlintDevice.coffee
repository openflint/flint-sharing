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

class FlintDevice extends EventEmitter

    constructor: ->
        @timeoutId = null
        @timeout = 60 * 1000

        # sub-classes should set these values
        @urlBase = null
        @friendlyName = null
        @uniqueId = null

    getUrlBase: ->
        return @urlBase

    getName: ->
        return @friendlyName

    getUniqueId: ->
        return @uniqueId

    getDeviceType: ->
        # 'ssdp' or 'mdns'
        null

    triggerTimer: ->
#        console.log @getName(), ' : trigger timer'
        @_clearTimer()
        @timeoutId = setTimeout (=>
            @_onTimeout()
        ), @timeout

    clear: ->
        @_clearTimer()

    _clearTimer: ->
        if @timeoutId
            clearTimeout @timeoutId

    _onTimeout: ->
#        console.warn @getName(), ' : timeout'
        @emit 'devicetimeout', @uniqueId

module.exports = FlintDevice
