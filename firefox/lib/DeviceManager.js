const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');
const { Cc, Ci, Cu } = require('chrome');

const { SSDPManager } = require('./ssdp/SSDPManager');
const { Device } = require('./Device');

const DeviceManager = Class({
    extends: EventTarget,

    ssdpManager_: null,

    devices_: {},

    initialize: function () {
        let self = this;
        this.ssdpManager_ = SSDPManager();
        this.ssdpManager_.on('devicefound', function (uniqueId, device) {
            if (typeof (self.devices_[uniqueId]) == 'undefined') {
                self._onDeviceFound(uniqueId, device);
            } else {
                self.devices_[uniqueId].triggerTimer();
            }
        });
    },

    start: function () {
        this.ssdpManager_.start();
    },

    stop: function () {
        this.ssdpManager_.stop();
    },

    _onDeviceFound: function (uniqueId, device) {
        let self = this;
        this.devices_[uniqueId] = Device(device);
        this.devices_[uniqueId].on('devicelost', function (_uniqueId) {
            self._onDeviceLost(_uniqueId);
        });
        this.devices_[uniqueId].triggerTimer();

//        console.log(this.devices_[uniqueId].getDevice());
//        console.log('add device, size = ', Object.keys(this.devices_).length);

        emit(this, 'devicefound', this.devices_[uniqueId].getDevice());
    },

    _onDeviceLost: function (uniqueId) {
        emit(this, 'devicelost', this.devices_[uniqueId].getDevice());

        delete this.devices_[uniqueId];
        console.log('remove device, size = ', Object.keys(this.devices_).length);
    },

    getDevices: function () {
        return this.devices_;
    }
});

exports.DeviceManager = DeviceManager;