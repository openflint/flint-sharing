(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var UdpSocket;

UdpSocket = (function() {
  UdpSocket.ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  UdpSocket.str2ab = function(str) {
    var buf, bufView, i, _;
    buf = new ArrayBuffer(str.length);
    bufView = new Uint8Array(buf);
    for (i in str) {
      _ = str[i];
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  function UdpSocket(options) {
    this.options = options;
    this.localPort_ = options.localPort;
    this.loopback_ = options.loopback;
    this.socketId_ = -1;
    this.multicastAddr_ = null;
    this._init();
  }

  UdpSocket.prototype._init = function() {
    var info;
    info = {
      'persistent': false,
      'name': 'udpSocket',
      'bufferSize': 4096
    };
    return chrome.sockets.udp.create(info, (function(_this) {
      return function(createInfo) {
        console.log('create UdpSocket: ', _this.socketId_);
        _this.socketId_ = createInfo.socketId;
        return chrome.sockets.udp.bind(_this.socketId_, '0.0.0.0', _this.localPort_, function(result) {
          console.log('bind UdpSocket: port=', _this.localPort_, ', result=', result);
          chrome.sockets.udp.onReceive.addListener(function(info) {
            if (_this.socketId_ === info.socketId) {
              return _this._onMessage(UdpSocket.ab2str(info.data));
            }
          });
          return chrome.sockets.udp.onReceive.addListener(function(info) {
            if (_this.socketId_ === info.socketId) {
              return _this._onError('error');
            }
          });
        });
      };
    })(this));
  };

  UdpSocket.prototype._onMessage = function(data) {
    console.log('received packet:\n', data);
    if (this.onmessage) {
      return this.onmessage(data);
    }
  };

  UdpSocket.prototype._onError = function(error) {
    if (this.onerror) {
      return this.onerror(error);
    }
  };

  UdpSocket.prototype.joinGroup = function(addr) {
    this.multicastAddr_ = addr;
    return chrome.sockets.udp.joinGroup(this.socketId_, addr, (function(_this) {
      return function(result) {
        return console.log('joinGroup UdpSocket: addr=', addr, ', result=', result);
      };
    })(this));
  };

  UdpSocket.prototype.send = function(addr, data) {
    var _data;
    _data = UdpSocket.str2ab(data);
    return chrome.sockets.udp.send(this.socketId_, addr, this.localPort_, (function(_this) {
      return function(sendInfo) {
        if (sendInfo.resultCode < 0) {
          return console.error('UdpSocket: send error!!!');
        } else {
          return console.log('UdpSocket: send success, ', sendInfo.bytesSent);
        }
      };
    })(this));
  };

  return UdpSocket;

})();

module.exports = UdpSocket;



},{}]},{},[1]);
