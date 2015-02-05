"use strict";

const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');
const { Cc, Ci, Cu } = require('chrome');

const { SSDPResponder } = require('./SSDPResponder');

var Request = require("sdk/request").Request;

const SSDPManager = Class({
    extends: EventTarget,

    responder_: null,

    initialize: function () {
        var self = this;
        this.responder_ = new SSDPResponder();
        this.responder_.on('servicefound', function (location) {
            self._onServiceFound(location);
        });
        this.responder_.on('servicegone', function (location) {
            self._onServiceGone(location);
        });
    },

    start: function () {
        this.responder_.start();
    },

    stop: function () {
        this.responder_.stop();
    },

    _onServiceGone: function (location) {
    },

    _onServiceFound: function (location) {
        var self = this;
        Request({
            url: location,
            overrideMimeType: 'text/xml',
            onComplete: function (response) {
                if (response.status == 200) {
                    self._parseDeviceDesc(location, response.text);
                }
            }
        }).get();
    },

    _parseDeviceDesc: function (location, text) {
        try {
            var device = {};
            device['location'] = location;

            var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
            var xml = parser.parseFromString(text, "text/xml");
            var urlBase = null;
            var urls = xml.querySelectorAll('URLBase');
            if ((urls != null) && (urls.length > 0)) {
                urlBase = urls[0].innerHTML;
            } else {
                return
            }

            device['urlBase'] = urlBase;

            var deviceNodeList = xml.querySelectorAll('device');
            if ((deviceNodeList != null) && (deviceNodeList.length > 0)) {
                device['uniqueId'] = deviceNodeList[0].querySelector("UDN").innerHTML + location;
                device['deviceType'] = deviceNodeList[0].querySelector('deviceType').innerHTML;
                device['friendlyName'] = deviceNodeList[0].querySelector('friendlyName').innerHTML;
                device['manufacturer'] = deviceNodeList[0].querySelector('manufacturer').innerHTML;
                device['modelName'] = deviceNodeList[0].querySelector('modelName').innerHTML;
            }

            emit(this, 'devicefound', device['uniqueId'], device);
        } catch (e) {
            console.error('parse device descript error: ', e);
        }
    }
});

exports.SSDPManager = SSDPManager;
