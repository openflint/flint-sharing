const { Class } = require('sdk/core/heritage');
const { EventTarget } = require('sdk/event/target');
const { emit } = require('sdk/event/core');
const { Cc, Ci, Cu } = require('chrome');

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

XPCOMUtils.defineLazyGetter(this, 'converter', function () {
    let conv = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
    conv.charset = 'utf8';
    return conv;
});

const UDPSocket = Class({
    extends: EventTarget,

    socket_: null,
    addr_: null,
    port_: 0,

    initialize: function (addr, port) {
        this.addr_ = addr;
        this.port_ = port;

        this.socket_ = Cc['@mozilla.org/network/udp-socket;1'].createInstance(Ci.nsIUDPSocket);
        if (this.socket_ == null) {
            console.error('UDPSocket: create socket failed!');
            return;
        }
        try {
            this.socket_.init(port, false);
            this.socket_.asyncListen(this);
        } catch (e) {
            console.error('UDPSocket: failed to init socket: ' + e);
            return;
        }
    },

    send: function (packet) {
        console.info('UDPSocket: send [', packet, ']', ' to [', this.addr_, ':', this.port_, ']');
        try {
            let packetRaw = converter.convertToByteArray(packet);
            this.socket_.send(this.addr_, this.port_, packetRaw, packetRaw.length);
        } catch (e) {
            console.error('UDPSocket: send error : ' + e);
        }
    },

    close: function() {
        this.socket_.close();
    },

    onPacketReceived: function (socket, packet) {
        emit(this, 'data', packet.data);
    }
});

exports.UDPSocket = UDPSocket;