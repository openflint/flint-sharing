"use strict";

const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');

var timer = require('sdk/timers');

const { UDPSocket } = require('./UDPSocket');

const SSDP_DISCOVER_PACKET =
    "M-SEARCH * HTTP/1.1\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "MX: 10\r\n" +
    "ST: urn:dial-multiscreen-org:service:dial:1\r\n\r\n";

const RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/;
const HEADER_PAIR = /^([^:]+):\s*(.*)$/;

const SSDPResponder = Class({
    extends: EventTarget,

    socket_: null,
    timerId_: null,

    initialize: function () {
    },

    start: function () {
        var self = this;

        this.socket_ = new UDPSocket({
            loopback: false,
            localPort: 1900
        });

        this.socket_.joinMulticastGroup('239.255.255.250');

        this.socket_.on('data', function (data) {
            self._onData(data);
        });

        this.timerId_ = timer.setInterval(function () {
            self._search();
        }, 3000);
    },

    stop: function () {
        timer.clearInterval(this.timerId_);
        this.socket_.close();
    },

    _search: function () {
        this.socket_.send(SSDP_DISCOVER_PACKET, '239.255.255.250', 1900);
    },

    _onData: function (data) {
        var self = this;

        var lines = data.toString().split('\r\n');
        var firstLine = lines.shift();

        var method = null;
        if (RESPONSE_HEADER.test(firstLine)) {
            method = 'RESPONSE';
        } else {
            method = firstLine.split(' ')[0].toUpperCase();
        }

        var headers = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length > 0) {
                var pairs = line.match(HEADER_PAIR);
                headers[pairs[1].toLowerCase()] = pairs[2]
            }
        }

        if (headers['location']) {
            if (method == 'M-SEARCH') {
                // ignore
            } else if (method == 'RESPONSE') {
                self._onResponse(headers);
            } else if (method == 'NOTIFY') {
                self._onNotify(headers);
            } else {
                // ignore
            }
        }
    },

    _onResponse: function (headers) {
        if ((headers['location']) && ('urn:dial-multiscreen-org:service:dial:1' === headers['st'])) {
            emit(this, 'servicefound', headers['location']);
        }
    },

    _onNotify: function (headers) {
        if (headers['nts'] == 'ssdp:alive') {
            emit(this, 'servicefound', headers['location']);
        } else if (headers['nts'] == 'ssdp:byebye') {
            emit(this, 'servicegone', headers['location']);
        }
    }
});

exports.SSDPResponder = SSDPResponder;