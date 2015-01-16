const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');
const { Cc, Ci, Cu } = require('chrome');

const { SSDPResponder } = require('./SSDPResponder');

var Request = require("sdk/request").Request;

const SSDPManager = Class({
    extends: EventTarget,

    ssdpResponder_: null,

    initialize: function () {
        let self = this;
        this.ssdpResponder_ = SSDPResponder();
        this.ssdpResponder_.on('location', function (location) {
            self._fetchDeviceDesc(location);
        });
    },

    start: function () {
        this.ssdpResponder_.start();
    },

    stop: function () {
        this.ssdpResponder_.stop();
    },

    _fetchDeviceDesc: function (location) {
        let self = this;
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
            let device = {};
            device['location'] = location;

            var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
            let xml = parser.parseFromString(text, "text/xml");
            let urlBase = null;
            let urls = xml.querySelectorAll('URLBase');
            if ((urls != null) && (urls.length > 0)) {
                urlBase = urls[0].innerHTML;
            } else {
                return
            }

            device['urlBase'] = urlBase;

            let deviceNodeList = xml.querySelectorAll('device');
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
