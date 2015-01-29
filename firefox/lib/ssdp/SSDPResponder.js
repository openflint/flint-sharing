const { Class }  = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');

var timer = require('sdk/timers');

const { UDPSocket } = require('../udp/UDPSocket');

const DIAL_DISCOVER_PACKET =
    "M-SEARCH * HTTP/1.1\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "MX: 3\r\n" +
    "ST: urn:dial-multiscreen-org:service:dial:1\r\n\r\n";

const DIAL_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/
const DIAL_HEADER = /^([^:]+):\s*(.*)$/

const SSDPResponder = Class({
    extends: EventTarget,

    udp_: null,
    timerId_: null,

    initialize: function () {
        let self = this;
        this.udp_ = new UDPSocket('239.255.255.250', 1900);
        this.udp_.on('data', function (data) {
            self._onData(data);
        });
    },

    start: function () {
        let self = this;
        this.udp_.start();

        this.timerId_ = timer.setInterval(function () {
            self._search();
        }, 3000);
    },

    stop: function () {
        timer.clearInterval(this.timerId_);

        this.udp_.stop();
    },

    _search: function () {
        this.udp_.send(DIAL_DISCOVER_PACKET);
    },

    _onData: function (data) {
        let lines = data.toString().split('\r\n');
        let firstLine = lines.shift();

        let method = null;
        if (DIAL_RESPONSE_HEADER.test(firstLine)) {
            method = 'RESPONSE';
        } else {
            method = firstLine.split(' ')[0].toUpperCase();
        }

        let headers = {};
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.length > 0) {
                let pairs = line.match(/^([^:]+):\s*(.*)$/);
                headers[pairs[1].toLowerCase()] = pairs[2]
            }
        }

        if (method == 'M-SEARCH') {
            // ignore
        } else if (method == 'RESPONSE') {
            this._onResponse(headers);
        } else if (method == 'NOTIFY') {
            this._onNotify(headers);
        } else {
            // ignore
        }
    },

    _onResponse: function (headers) {
//        console.log('on response: ', headers['location']);
        emit(this, 'location', headers['location']);
    },

    _onNotify: function (headers) {
//        console.log('on notify: ', headers['location'], ', ', headers['nts']);
        if (headers['nts'] == 'ssdp:alive') {
            emit(this, 'location', headers['location']);
        }
    }
});

exports.SSDPResponder = SSDPResponder;