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
PluginLoader = require '../../plugin/PluginLoader'
SSDPDevice = require './SSDPDevice'

class SSDPManager extends EventEmitter

    constructor: ->
        @devices = {}

        options =
            st: 'urn:dial-multiscreen-org:service:dial:1'
        @ssdp = PluginLoader.getPlugin().createSSDPResponder options

        # 'url' is the location of device description
        @ssdp.on 'serviceFound', (url) =>
            if not @devices[url]
                # make @devices[url] non-null immediately
                @devices[url] = url
                @_fetchDeviceDesc url
            else
                if @devices[url].triggerTimer
                    @devices[url].triggerTimer()

        @ssdp.on 'serviceLost', (url) =>
            if @devices[url]
                device = @devices[url]
                @emit 'removedevice', device
                device.clear()
                delete @devices[url]

    start: ->
        @ssdp.start()

    stop: ->
        @ssdp.stop()

    _fetchDeviceDesc: (url) ->
        xhr = PluginLoader.getPlugin().createXMLHttpRequest()
        if not xhr
            throw '_fetchDeviceDesc: failed'

        xhr.open 'GET', url
        xhr.onreadystatechange = =>
            if xhr.readyState is 4
#                console.log 'SSDPManager received:\n', xhr.responseText
                @_parseDeviceDesc xhr.responseText, url
        xhr.send ''

    _parseDeviceDesc: (data, url) ->
        try
            xml = null
            if window.DOMParser # Standard
                parser = new DOMParser()
                xml = parser.parseFromString data, "text/xml"
            else # for IE
                xml = new ActiveXObject "Microsoft.XMLDOM"
                xml.async = "false"
                xml.loadXML data

            urlBase = null
            urls = xml.querySelectorAll 'URLBase'
            if urls and urls.length > 0
                urlBase = urls[0].innerHTML

            devices = xml.querySelectorAll 'device'
            if devices.length > 0
                @_parseSingleDeviceDesc devices[0], urlBase, url
        catch e
            console.error e

    _parseSingleDeviceDesc: (deviceNode, urlBase, url) ->
        deviceType = deviceNode.querySelector('deviceType').innerHTML
        udn = deviceNode.querySelector("UDN").innerHTML
        friendlyName = deviceNode.querySelector('friendlyName').innerHTML
        manufacturer = deviceNode.querySelector('manufacturer').innerHTML
        modelName = deviceNode.querySelector('modelName').innerHTML
        device = new SSDPDevice
            uniqueId: udn
            urlBase: urlBase
            deviceType: deviceType
            udn: udn
            friendlyName: friendlyName
            manufacturer: manufacturer
            modelName: modelName
        device.triggerTimer()
        @devices[url] = device
        @emit 'adddevice', device

module.exports = SSDPManager