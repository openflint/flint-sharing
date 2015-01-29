/*! flint-web-sdk build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var EventEmitter, FlintDevice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

FlintDevice = (function(_super) {
  __extends(FlintDevice, _super);

  function FlintDevice() {
    this.timeoutId = null;
    this.timeout = 60 * 1000;
    this.urlBase = null;
    this.host = null;
    this.friendlyName = null;
    this.uniqueId = null;
  }

  FlintDevice.prototype.getUrlBase = function() {
    return this.urlBase;
  };

  FlintDevice.prototype.getHost = function() {
    return this.host;
  };

  FlintDevice.prototype.getName = function() {
    return this.friendlyName;
  };

  FlintDevice.prototype.getUniqueId = function() {
    return this.uniqueId;
  };

  FlintDevice.prototype.getDeviceType = function() {
    return null;
  };

  FlintDevice.prototype.toJson = function() {
    var json;
    json = {
      deviceName: this.friendlyName,
      urlBase: this.urlBase,
      host: this.host,
      uniqueId: this.uniqueId
    };
    return json;
  };

  FlintDevice.prototype.triggerTimer = function() {
    this._clearTimer();
    return this.timeoutId = setTimeout(((function(_this) {
      return function() {
        return _this._onTimeout();
      };
    })(this)), this.timeout);
  };

  FlintDevice.prototype.clear = function() {
    return this._clearTimer();
  };

  FlintDevice.prototype._clearTimer = function() {
    if (this.timeoutId) {
      return clearTimeout(this.timeoutId);
    }
  };

  FlintDevice.prototype._onTimeout = function() {
    return this.emit('devicetimeout', this.uniqueId);
  };

  return FlintDevice;

})(EventEmitter);

module.exports = FlintDevice;



},{"eventemitter3":11}],2:[function(require,module,exports){
var EventEmitter, FlintDevice, FlintDeviceScanner,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

FlintDevice = require('./FlintDevice');

FlintDeviceScanner = (function(_super) {
  var INTERVAL;

  __extends(FlintDeviceScanner, _super);

  INTERVAL = 10 * 1000;

  function FlintDeviceScanner() {
    this.devices = {};
    this.ssdpManager = null;
    this._init();
  }

  FlintDeviceScanner.prototype._init = function() {
    return this._initSSDP();
  };

  FlintDeviceScanner.prototype._createSSDP = function() {
    throw 'Not Implement';
  };

  FlintDeviceScanner.prototype._initSSDP = function() {
    console.info('init SSDPManager');
    this.ssdpManager = this._createSSDP();
    this.ssdpManager.on('adddevice', (function(_this) {
      return function(device) {
        return _this._addDevice(device);
      };
    })(this));
    return this.ssdpManager.on('removedevice', (function(_this) {
      return function(uniqueId) {
        return _this._removeDevice(uniqueId);
      };
    })(this));
  };

  FlintDeviceScanner.prototype._addDevice = function(device) {
    var uniqueId;
    uniqueId = device.getUniqueId();
    if (!this.devices[uniqueId]) {
      console.log('found device: ', device.getName());
      this.devices[uniqueId] = device;
      device.on('devicetimeout', (function(_this) {
        return function(_uniqueId) {
          return _this._removeDevice(_uniqueId);
        };
      })(this));
      return this.emit('devicefound', device);
    }
  };

  FlintDeviceScanner.prototype._removeDevice = function(uniqueId) {
    if (this.devices[uniqueId]) {
      console.warn('gone device: ', this.devices[uniqueId].getName());
      this.emit('devicegone', this.devices[uniqueId]);
      return delete this.devices[uniqueId];
    }
  };

  FlintDeviceScanner.prototype.start = function() {
    var _ref;
    return (_ref = this.ssdpManager) != null ? _ref.start() : void 0;
  };

  FlintDeviceScanner.prototype.stop = function() {
    var _ref;
    return (_ref = this.ssdpManager) != null ? _ref.stop() : void 0;
  };

  FlintDeviceScanner.prototype.getDeviceList = function() {
    var dList, value, _, _ref;
    dList = [];
    _ref = this.devices;
    for (_ in _ref) {
      value = _ref[_];
      dList.push(value);
    }
    return dList;
  };

  return FlintDeviceScanner;

})(EventEmitter);

module.exports = FlintDeviceScanner;



},{"./FlintDevice":1,"eventemitter3":11}],3:[function(require,module,exports){
var FlintDeviceScanner, FlintDeviceScannerChrome, SSDPManagerChrome,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FlintDeviceScanner = require('../FlintDeviceScanner');

SSDPManagerChrome = require('./SSDPManagerChrome');

FlintDeviceScannerChrome = (function(_super) {
  var INTERVAL;

  __extends(FlintDeviceScannerChrome, _super);

  INTERVAL = 10 * 1000;

  function FlintDeviceScannerChrome() {
    FlintDeviceScannerChrome.__super__.constructor.apply(this, arguments);
  }

  FlintDeviceScannerChrome.prototype._createSSDP = function() {
    return new SSDPManagerChrome();
  };

  return FlintDeviceScannerChrome;

})(FlintDeviceScanner);

module.exports = FlintDeviceScannerChrome;



},{"../FlintDeviceScanner":2,"./SSDPManagerChrome":4}],4:[function(require,module,exports){
var SSDPManager, SSDPManagerChrome, SSDPResponderChrome,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SSDPManager = require('../ssdp/SSDPManager');

SSDPResponderChrome = require('./SSDPResponderChrome');

SSDPManagerChrome = (function(_super) {
  __extends(SSDPManagerChrome, _super);

  function SSDPManagerChrome() {
    SSDPManagerChrome.__super__.constructor.apply(this, arguments);
  }

  SSDPManagerChrome.prototype._createSSDPResponder = function(options) {
    return new SSDPResponderChrome(options);
  };

  SSDPManagerChrome.prototype._createXhr = function() {
    return new XMLHttpRequest();
  };

  return SSDPManagerChrome;

})(SSDPManager);

module.exports = SSDPManagerChrome;



},{"../ssdp/SSDPManager":9,"./SSDPResponderChrome":5}],5:[function(require,module,exports){
var SSDPResponder, SSDPResponderChrome, UdpSocketChrome,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SSDPResponder = require('../ssdp/SSDPResponder');

UdpSocketChrome = require('./UdpSocketChrome');

SSDPResponderChrome = (function(_super) {
  __extends(SSDPResponderChrome, _super);

  function SSDPResponderChrome(options) {
    this.options = options;
    SSDPResponderChrome.__super__.constructor.call(this, options);
  }

  SSDPResponderChrome.prototype._createUdpSocket = function(options) {
    return new UdpSocketChrome(options);
  };

  return SSDPResponderChrome;

})(SSDPResponder);

module.exports = SSDPResponderChrome;



},{"../ssdp/SSDPResponder":10,"./UdpSocketChrome":6}],6:[function(require,module,exports){
var EventEmitter, UdpSocketChrome,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

UdpSocketChrome = (function(_super) {
  __extends(UdpSocketChrome, _super);

  UdpSocketChrome.ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  UdpSocketChrome.str2ab = function(str) {
    var buf, bufView, i, _;
    buf = new ArrayBuffer(str.length);
    bufView = new Uint8Array(buf);
    for (i in str) {
      _ = str[i];
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  function UdpSocketChrome(options) {
    this.options = options;
    this.localPort_ = options.localPort;
    this.loopback_ = options.loopback;
    this.socketId_ = -1;
    this._init();
  }

  UdpSocketChrome.prototype._init = function() {
    var udpInfo;
    udpInfo = {
      'persistent': false,
      'name': 'Flint',
      'bufferSize': 4096
    };
    return chrome.sockets.udp.create(udpInfo, (function(_this) {
      return function(createInfo) {
        _this.socketId_ = createInfo.socketId;
        console.log('create UdpSocket: ', _this.socketId_);
        chrome.sockets.udp.setMulticastLoopbackMode(_this.socketId_, _this.loopback_, function(result) {
          return console.log('setMulticastLoopbackMode UdpSocket: loopback=', _this.loopback_, ', result=', result);
        });
        chrome.sockets.udp.bind(_this.socketId_, '0.0.0.0', _this.localPort_, function(result) {
          console.log('bind UdpSocket: port=', _this.localPort_, ', result=', result);
          return _this.emit('bind');
        });
        chrome.sockets.udp.onReceive.addListener(function(info) {
          if (_this.socketId_ === info.socketId) {
            return _this._onMessage(UdpSocketChrome.ab2str(info.data));
          }
        });
        chrome.sockets.udp.onReceive.addListener(function(info) {
          if (_this.socketId_ === info.socketId) {
            return _this._onError('error');
          }
        });
        return _this.emit('create');
      };
    })(this));
  };

  UdpSocketChrome.prototype._onMessage = function(data) {
    if (this.onPacket) {
      return this.onPacket(data);
    }
  };

  UdpSocketChrome.prototype._onError = function(error) {
    if (this.onError) {
      return this.onError(error);
    }
  };

  UdpSocketChrome.prototype.joinMulticastGroup = function(addr) {
    if (this.socketId_ === -1) {
      return this.once('create', (function(_this) {
        return function() {
          return _this._joinMulticastGroup(addr);
        };
      })(this));
    } else {
      return this._joinMulticastGroup(addr);
    }
  };

  UdpSocketChrome.prototype._joinMulticastGroup = function(addr) {
    return chrome.sockets.udp.joinGroup(this.socketId_, addr, (function(_this) {
      return function(result) {
        return console.log('joinGroup UdpSocket: addr=', addr, ', result=', result);
      };
    })(this));
  };

  UdpSocketChrome.prototype.send = function(data, addr, port) {
    var _data;
    if (this.socketId_ === -1) {
      return;
    }
    _data = UdpSocketChrome.str2ab(data);
    return chrome.sockets.udp.send(this.socketId_, _data, addr, port, (function(_this) {
      return function(sendInfo) {
        if (sendInfo.resultCode < 0) {
          return console.error('UdpSocket: send error!!!');
        } else {
          return console.log('UdpSocket: send success, ', sendInfo.bytesSent);
        }
      };
    })(this));
  };

  UdpSocketChrome.prototype.close = function() {
    if (this.socketId_) {
      return chrome.sockets.udp.close(this.socketId_, (function(_this) {
        return function() {
          return console.log('socket closed! ', _this.socketId_);
        };
      })(this));
    }
  };

  return UdpSocketChrome;

})(EventEmitter);

module.exports = UdpSocketChrome;



},{"eventemitter3":11}],7:[function(require,module,exports){
window.FlintDeviceScanner = require('./FlintDeviceScannerChrome');



},{"./FlintDeviceScannerChrome":3}],8:[function(require,module,exports){
var FlintDevice, SSDPDevice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FlintDevice = require('../FlintDevice');

SSDPDevice = (function(_super) {
  __extends(SSDPDevice, _super);

  function SSDPDevice(deviceDesc) {
    SSDPDevice.__super__.constructor.apply(this, arguments);
    this.urlBase = deviceDesc.urlBase;
    if (this.urlBase.slice(-5) !== ':9431') {
      this.urlBase += ':9431';
    }
    this.host = this.urlBase.replace('http://', '');
    this.host = this.host.replace(':9431', '');
    this.friendlyName = deviceDesc.friendlyName;
    this.uniqueId = deviceDesc.udn;
  }

  SSDPDevice.prototype.getDeviceType = function() {
    return 'ssdp';
  };

  return SSDPDevice;

})(FlintDevice);

module.exports = SSDPDevice;



},{"../FlintDevice":1}],9:[function(require,module,exports){
var EventEmitter, SSDPDevice, SSDPManager, SSDPResponder,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

SSDPResponder = require('./SSDPResponder');

SSDPDevice = require('./SSDPDevice');

SSDPManager = (function(_super) {
  __extends(SSDPManager, _super);

  function SSDPManager() {
    this.devices = {};
    this.ssdp = this._createSSDPResponder({
      st: 'urn:dial-multiscreen-org:service:dial:1'
    });
    this.ssdp.on('serviceFound', (function(_this) {
      return function(url) {
        if (!_this.devices[url]) {
          _this.devices[url] = url;
          return _this._fetchDeviceDesc(url);
        } else {
          if (_this.devices[url].triggerTimer) {
            return _this.devices[url].triggerTimer();
          }
        }
      };
    })(this));
    this.ssdp.on('serviceLost', (function(_this) {
      return function(url) {
        var device;
        if (_this.devices[url]) {
          device = _this.devices[url];
          _this.emit('removedevice', device);
          device.clear();
          return delete _this.devices[url];
        }
      };
    })(this));
  }

  SSDPManager.prototype._createSSDPResponder = function(options) {
    throw 'Not Implement';
  };

  SSDPManager.prototype.start = function() {
    return this.ssdp.start();
  };

  SSDPManager.prototype.stop = function() {
    return this.ssdp.stop();
  };

  SSDPManager.prototype._fetchDeviceDesc = function(url) {
    var xhr;
    xhr = this._createXhr();
    if (!xhr) {
      throw '_fetchDeviceDesc: failed';
    }
    xhr.open('GET', url);
    xhr.onreadystatechange = (function(_this) {
      return function() {
        if (xhr.readyState === 4) {
          return _this._parseDeviceDesc(xhr.responseText, url);
        }
      };
    })(this);
    return xhr.send('');
  };

  SSDPManager.prototype._createXhr = function() {
    throw 'Not Implement';
  };

  SSDPManager.prototype._parseDeviceDesc = function(data, url) {
    var devices, e, parser, urlBase, urls, xml;
    try {
      xml = null;
      if (window.DOMParser) {
        parser = new DOMParser();
        xml = parser.parseFromString(data, "text/xml");
      } else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(data);
      }
      urlBase = null;
      urls = xml.querySelectorAll('URLBase');
      if (urls && urls.length > 0) {
        urlBase = urls[0].innerHTML;
      }
      devices = xml.querySelectorAll('device');
      if (devices.length > 0) {
        return this._parseSingleDeviceDesc(devices[0], urlBase, url);
      }
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  };

  SSDPManager.prototype._parseSingleDeviceDesc = function(deviceNode, urlBase, url) {
    var device, deviceType, friendlyName, manufacturer, modelName, udn;
    deviceType = deviceNode.querySelector('deviceType').innerHTML;
    udn = deviceNode.querySelector("UDN").innerHTML;
    friendlyName = deviceNode.querySelector('friendlyName').innerHTML;
    manufacturer = deviceNode.querySelector('manufacturer').innerHTML;
    modelName = deviceNode.querySelector('modelName').innerHTML;
    device = new SSDPDevice({
      uniqueId: udn,
      urlBase: urlBase,
      deviceType: deviceType,
      udn: udn,
      friendlyName: friendlyName,
      manufacturer: manufacturer,
      modelName: modelName
    });
    device.triggerTimer();
    this.devices[url] = device;
    return this.emit('adddevice', device);
  };

  return SSDPManager;

})(EventEmitter);

module.exports = SSDPManager;



},{"./SSDPDevice":8,"./SSDPResponder":10,"eventemitter3":11}],10:[function(require,module,exports){
var EventEmitter, SEARCH_INTERVAL, SSDPResponder, SSDP_ADDRESS, SSDP_DISCOVER_MX, SSDP_DISCOVER_PACKET, SSDP_HEADER, SSDP_PORT, SSDP_RESPONSE_HEADER, SSDP_SEARCH_TARGET,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

SEARCH_INTERVAL = 5 * 1000;

SSDP_PORT = 1900;

SSDP_ADDRESS = '239.255.255.250';

SSDP_DISCOVER_MX = 10;

SSDP_DISCOVER_PACKET = 'M-SEARCH * HTTP/1.1\r\n' + 'HOST: ' + SSDP_ADDRESS + ':' + SSDP_PORT + '\r\n' + 'MAN: \"ssdp:discover\"\r\n' + 'MX: ' + SSDP_DISCOVER_MX + '\r\n' + 'ST: %SEARCH_TARGET%\r\n\r\n';

SSDP_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/;

SSDP_HEADER = /^([^:]+):\s*(.*)$/;

SSDP_SEARCH_TARGET = 'urn:dial-multiscreen-org:service:dial:1';

SSDPResponder = (function(_super) {
  __extends(SSDPResponder, _super);

  function SSDPResponder(options) {
    this.options = options;
    this.socket = null;
    this.searchTimerId = null;
    this.started = false;
  }

  SSDPResponder.prototype._init = function() {
    this.socket = this._createUdpSocket({
      loopback: false,
      localPort: SSDP_PORT
    });
    this.socket.joinMulticastGroup(SSDP_ADDRESS);
    return this.socket.onPacket = (function(_this) {
      return function(packet) {
        return _this._onData(packet);
      };
    })(this);
  };

  SSDPResponder.prototype._createUdpSocket = function(options) {
    throw 'Not Implement';
  };

  SSDPResponder.prototype.start = function() {
    if (this.started) {
      throw 'SSDPResponder already started';
    }
    this.started = true;
    this._init();
    this.searchTimerId = setInterval(((function(_this) {
      return function() {
        return _this._search();
      };
    })(this)), SEARCH_INTERVAL);
    return this._search();
  };

  SSDPResponder.prototype._search = function() {
    var data, _data;
    data = SSDP_DISCOVER_PACKET;
    _data = data.replace('%SEARCH_TARGET%', SSDP_SEARCH_TARGET);
    return this.socket.send(_data, SSDP_ADDRESS, SSDP_PORT);
  };

  SSDPResponder.prototype.stop = function() {
    if (!this.started) {
      console.warn('SSDPResponder is not started');
      return;
    }
    this.started = false;
    if (this.searchTimerId) {
      clearInterval(this.searchTimerId);
    }
    return this.socket.close();
  };

  SSDPResponder.prototype._onData = function(data) {
    var firstLine, headers, lines, method;
    lines = data.toString().split('\r\n');
    firstLine = lines.shift();
    method = SSDP_RESPONSE_HEADER.test(firstLine) ? 'RESPONSE' : firstLine.split(' ')[0].toUpperCase();
    headers = {};
    lines.forEach((function(_this) {
      return function(line) {
        var pairs;
        if (line.length) {
          pairs = line.match(SSDP_HEADER);
          if (pairs) {
            return headers[pairs[1].toLowerCase()] = pairs[2];
          }
        }
      };
    })(this));
    if (method === 'M-SEARCH') {

    } else if (method === 'RESPONSE') {
      return this._onResponse(headers);
    } else if (method === 'NOTIFY') {
      return this._onNotify(headers);
    }
  };

  SSDPResponder.prototype._onResponse = function(headers) {
    if (headers.location && (this.options.st === headers.st)) {
      return this.emit('serviceFound', headers.location);
    }
  };

  SSDPResponder.prototype._onNotify = function(headers) {
    if (headers.location && (this.options.st === headers.nt)) {
      if (headers.nts === 'ssdp:alive') {
        return this.emit('serviceFound', headers.location);
      } else if (headers.nts === 'ssdp:byebye') {
        return this.emit('serviceLost', headers.location);
      }
    }
  };

  return SSDPResponder;

})(EventEmitter);

module.exports = SSDPResponder;



},{"eventemitter3":11}],11:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}]},{},[7]);
