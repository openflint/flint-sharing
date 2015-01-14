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

SEARCH_INTERVAL = 5 * 1000

SSDP_PORT = 1900
SSDP_ADDRESS = '239.255.255.250'

SSDP_DISCOVER_MX = 10
SSDP_DISCOVER_PACKET =
        'M-SEARCH * HTTP/1.1\r\n' +
        'HOST: ' + SSDP_ADDRESS + ':' + SSDP_PORT + '\r\n' +
        'MAN: \"ssdp:discover\"\r\n' +
        'MX: ' + SSDP_DISCOVER_MX + '\r\n' +
        'ST: %SEARCH_TARGET%\r\n\r\n'
SSDP_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/
SSDP_HEADER = /^([^:]+):\s*(.*)$/

SSDP_SEARCH_TARGET = 'urn:dial-multiscreen-org:service:dial:1'

class FfoxSSDPResponder extends EventEmitter

    constructor: (@pluginLoader, @options) ->
        @socket = null
        @searchTimerId = null
        @started = false

    _init: ->
        @socket = new UDPSocket
            loopback: true
            localPort: SSDP_PORT
        @socket.joinMulticastGroup SSDP_ADDRESS

        @socket.onmessage = (event) =>
            msg = String.fromCharCode.apply null, new Uint8Array(event.data)
            @_onData(msg)

    start: ->
        if @started
            throw 'FfosSSDPResponder already started'

        @started = true
        @_init()

        @searchTimerId = setInterval (=>
            @_search()), SEARCH_INTERVAL
        @_search()

    _search: ->
        data = SSDP_DISCOVER_PACKET
        _data = data.replace '%SEARCH_TARGET%', SSDP_SEARCH_TARGET
        @socket.send _data, SSDP_ADDRESS, SSDP_PORT

    stop: ->
        if not @started
            console.warn 'FfosSSDPResponder is not started'
            return

        @started = false
        if @searchTimerId
            clearInterval @searchTimerId

    _onData: (data) ->
        lines = data.toString().split '\r\n'
        firstLine = lines.shift()
        method =
            if SSDP_RESPONSE_HEADER.test(firstLine)
                'RESPONSE'
            else
                firstLine.split(' ')[0].toUpperCase()
        headers = {}
        lines.forEach (line) =>
            if line.length
                pairs = line.match(SSDP_HEADER)
                if pairs
                    headers[pairs[1].toLowerCase()] = pairs[2]

        if method is 'M-SEARCH'
            # ignore
        else if method is 'RESPONSE'
            @_onResponse headers
        else if method is 'NOTIFY'
            @_onNotify headers

    _onResponse: (headers) ->
        if headers.location and (@options.st is headers.st)
            @emit 'serviceFound', headers.location

    _onNotify: (headers) ->
        if headers.location and (@options.st is headers.nt)
            if headers.nts is 'ssdp:alive'
                @emit 'serviceFound', headers.location
            else if headers.nts is 'ssdp:byebye'
                @emit 'serviceLost', headers.location

module.exports = FfoxSSDPResponder
