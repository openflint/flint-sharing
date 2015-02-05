const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');

var timer = require('sdk/timers');

const FlintDevice = Class({
    extends: EventTarget,

    uniqueId_: null,
    deviceType_: null,
    friendlyName_: null,
    manufacturer_: null,
    modelName_: null,

    location_: null,
    urlBase_: null,

    timerId_: null,

    initialize: function (device) {
        this.uniqueId_ = device['uniqueId'];
        this.deviceType_ = device['deviceType'];
        this.friendlyName_ = device['friendlyName'];
        this.manufacturer_ = device['manufacturer'];
        this.modelName_ = device['modelName'];

        this.location_ = device['location'];
        this.urlBase_ = device['urlBase'];
        this.host_ = this.urlBase_.replace('http://', '');
        this.host_ = this.host_.replace(':9431', '');
    },

    triggerTimer: function () {
        var self = this;
        this._clearTimer();
        this.timerId_ = timer.setTimeout(function () {
            self._onTimeout();
        }, 30 * 1000);
    },

    _onTimeout: function () {
        emit(this, 'devicegone', this.uniqueId_);
    },

    clear: function () {
        this._clearTimer();
    },

    _clearTimer: function () {
        timer.clearTimeout(this.timerId_);
    },

    getUniqueId: function () {
        return this.uniqueId_;
    },

    getDeviceType: function () {
        return this.deviceType_;
    },

    getName: function () {
        return this.friendlyName_;
    },

    getManufacture: function () {
        return this.manufacturer_;
    },

    getModelName: function () {
        return this.modelName_;
    },

    getLocation: function () {
        return this.location_;
    },

    getUrlBase: function () {
        return this.urlBase_;
    },

    getHost: function () {
        return this.host_;
    },

    toJson: function () {
        return {
            uniqueId: this.uniqueId_,
            location: this.location_,
            urlBase: this.urlBase_,
            host: this.host_,
            deviceType: this.deviceType_,
            deviceName: this.friendlyName_,
            manufacture: this.manufacturer_,
            modelName: this.modelName_
        };
    }
});

exports.FlintDevice = FlintDevice;