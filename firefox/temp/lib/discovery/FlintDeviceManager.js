"use strict";

const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');
const { Cc, Ci, Cu } = require('chrome');

const { SSDPManager } = require('./SSDPManager');
const { FlintDevice } = require('./FlintDevice');

const FlintDeviceManager = Class({
    extends: EventTarget,

    manager_: null,

    devices_: {},

    initialize: function () {
        var self = this;
        this.manager_ = new SSDPManager();
        this.manager_.on('devicefound', function (uniqueId, device) {
            if (typeof (self.devices_[uniqueId]) == 'undefined') {
                self._onDeviceFound(uniqueId, device);
            } else {
                self.devices_[uniqueId].triggerTimer();
            }
        });
    },

    start: function () {
        this.manager_.start();
    },

    stop: function () {
        this.manager_.stop();
    },

    _onDeviceFound: function (uniqueId, device) {
        var self = this;
        this.devices_[uniqueId] = new FlintDevice(device);
        this.devices_[uniqueId].on('devicegone', function (_uniqueId) {
            self._onDeviceGone(_uniqueId);
        });
        this.devices_[uniqueId].triggerTimer();

        emit(this, 'devicefound', this.devices_[uniqueId].toJson());
    },

    _onDeviceGone: function (uniqueId) {
        emit(this, 'devicegone', this.devices_[uniqueId].toJson());
        delete this.devices_[uniqueId];
        console.log('remove device, size = ', Object.keys(this.devices_).length);
    },

    getDevices: function () {
        var devices = [];
        for (var _device in this.devices_) {
            devices.push(this.devices_[_device]);
        }
        return devices;
    }
});

exports.FlintDeviceManager = FlintDeviceManager;