/*! flint-web-sdk build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dataBrowser = [
    {
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    },
    {
        string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    },
    {
        string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
    },
    {
        prop: window.opera,
        identity: "Opera",
        versionSearch: "Version"
    },
    {
        string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
    },
    {
        string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
    },
    {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
    },
    {
        string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
    },
    {		// for newer Netscapes (6+)
        string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
    },
    {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
    },
    {
        string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
    },
    { 		// for older Netscapes (4-)
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }
];

var dataOS = [
    {
        string: navigator.platform,
        subString: "Win",
        identity: "Windows"
    },
    {
        string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
    },
    {
        string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
    },
    {
        string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
    }
];

BrowserDetect = function () {
};

BrowserDetect.prototype.init = function () {
    this.browser = this.searchString(dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent)
        || this.searchVersion(navigator.appVersion)
        || "an unknown version";
    this.OS = this.searchString(dataOS) || "an unknown OS";
};

BrowserDetect.prototype.searchString = function (data) {
    for (var i = 0; i < data.length; i++) {
        var dataString = data[i].string;
        var dataProp = data[i].prop;
        this.versionSearchString = data[i].versionSearch || data[i].identity;
        if (dataString) {
            if (dataString.indexOf(data[i].subString) != -1)
                return data[i].identity;
        }
        else if (dataProp)
            return data[i].identity;
    }
};

BrowserDetect.prototype.searchVersion = function (dataString) {
    var sIndex = dataString.indexOf(this.versionSearchString);
    if (sIndex == -1) return;
    var reg = /(?:;|\s|$)/gi;
    reg.lastIndex = sIndex = sIndex + this.versionSearchString.length + 1;
    var eIndex = reg.exec(dataString).index;
    return dataString.substring(sIndex, eIndex);
    //return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
};

module.exports = BrowserDetect;
},{}],2:[function(require,module,exports){
var BrowserDetect, Platform;

BrowserDetect = require('./BrowserDetect');

Platform = (function() {
  function Platform() {}

  Platform.detector = null;

  Platform.getPlatform = function() {
    var platform;
    if (!Platform.detector) {
      Platform.detector = new BrowserDetect();
      Platform.detector.init();
      if (Platform.detector.browser.toLowerCase() === 'firefox') {
        if (window.MozActivity !== void 0) {
          Platform.detector.browser = 'ffos';
        }
      } else if (Platform.detector.browser.toLowerCase() === 'chrome') {
        if (chrome.sockets !== void 0) {
          Platform.detector.browser = 'chrome_app';
        }
      }
    }
    platform = {
      browser: Platform.detector.browser.toLowerCase(),
      version: Platform.detector.version.toLowerCase(),
      os: Platform.detector.OS.toLowerCase()
    };
    return platform;
  };

  return Platform;

})();

module.exports = Platform;



},{"./BrowserDetect":1}],3:[function(require,module,exports){
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



},{"eventemitter3":13}],4:[function(require,module,exports){
var EventEmitter, FlintDevice, FlintDeviceScanner, MDNSManager, SSDPManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

FlintDevice = require('./FlintDevice');

SSDPManager = require('./ssdp/SSDPManager');

MDNSManager = require('./mdns/MDNSManager');

FlintDeviceScanner = (function(_super) {
  var INTERVAL;

  __extends(FlintDeviceScanner, _super);

  INTERVAL = 10 * 1000;

  function FlintDeviceScanner() {
    this.devices = {};
    this.ssdpManager = null;
    this.mdnsManager = null;
    this._init();
  }

  FlintDeviceScanner.prototype._init = function() {
    this._initSSDP();
    return this._initmDns();
  };

  FlintDeviceScanner.prototype._initSSDP = function() {
    console.info('init SSDPManager');
    this.ssdpManager = new SSDPManager();
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

  FlintDeviceScanner.prototype._initmDns = function() {
    console.info('init MDNSManager');
    this.mdnsManager = new MDNSManager();
    this.mdnsManager.on('adddevice', (function(_this) {
      return function(device) {
        return _this._addDevice(device);
      };
    })(this));
    return this.mdnsManager.on('removedevice', (function(_this) {
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
    var _ref, _ref1;
    console.log('##############ssdp FlintDeviceScanner start');
    if ((_ref = this.ssdpManager) != null) {
      _ref.start();
    }
    return (_ref1 = this.mdnsManager) != null ? _ref1.start() : void 0;
  };

  FlintDeviceScanner.prototype.stop = function() {
    var _ref, _ref1;
    if ((_ref = this.ssdpManager) != null) {
      _ref.stop();
    }
    return (_ref1 = this.mdnsManager) != null ? _ref1.stop() : void 0;
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



},{"./FlintDevice":3,"./mdns/MDNSManager":6,"./ssdp/SSDPManager":8,"eventemitter3":13}],5:[function(require,module,exports){
window.FlintDeviceScanner = require('./FlintDeviceScanner');



},{"./FlintDeviceScanner":4}],6:[function(require,module,exports){
var EventEmitter, MDNSManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

MDNSManager = (function(_super) {
  __extends(MDNSManager, _super);

  function MDNSManager() {
    null;
  }

  MDNSManager.prototype.start = function() {
    return null;
  };

  MDNSManager.prototype.stop = function() {
    return null;
  };

  return MDNSManager;

})(EventEmitter);

module.exports = MDNSManager;



},{"eventemitter3":13}],7:[function(require,module,exports){
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



},{"../FlintDevice":3}],8:[function(require,module,exports){
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
    this.ssdp = new SSDPResponder({
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

  SSDPManager.prototype.start = function() {
    console.log('##############ssdp SSDPManager start');
    return this.ssdp.start();
  };

  SSDPManager.prototype.stop = function() {
    return this.ssdp.stop();
  };

  SSDPManager.prototype._fetchDeviceDesc = function(url) {
    var xhr;
    xhr = PlatformLoader.getPlatform().createXMLHttpRequest();
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



},{"./SSDPDevice":7,"./SSDPResponder":9,"eventemitter3":13}],9:[function(require,module,exports){
var EventEmitter, PlatformLoader, SEARCH_INTERVAL, SSDPResponder, SSDP_ADDRESS, SSDP_DISCOVER_MX, SSDP_DISCOVER_PACKET, SSDP_HEADER, SSDP_PORT, SSDP_RESPONSE_HEADER, SSDP_SEARCH_TARGET,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

PlatformLoader = require('../../platform/PlatformLoader');

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
    console.log('##############call createUdpSocket: ', this.socket);
    this.socket = PlatformLoader.createUdpSocket({
      loopback: true,
      localPort: SSDP_PORT
    });
    this.socket.joinMulticastGroup(SSDP_ADDRESS);
    return this.socket.onPacketReceived = (function(_this) {
      return function(packet) {
        return _this._onData(packet);
      };
    })(this);
  };

  SSDPResponder.prototype.start = function() {
    console.log('##############ssdp responder start: ', this.started);
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
      return clearInterval(this.searchTimerId);
    }
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



},{"../../platform/PlatformLoader":10,"eventemitter3":13}],10:[function(require,module,exports){
var ChromeUdpSocket, FfosUdpSocket, Platform, PlatformLoader;

Platform = require('../common/Platform');

ChromeUdpSocket = require('./chrome_app/ChromeUdpSocket');

FfosUdpSocket = require('./ffos/FfosUdpSocket');

PlatformLoader = (function() {
  function PlatformLoader() {}

  PlatformLoader.createXMLHttpRequest = function() {
    var e, platform;
    platform = Platform.getPlatform();
    try {
      switch (platform.browser) {
        case 'ffos':
          return new XMLHttpRequest({
            mozSystem: true
          });
        default:
          return new XMLHttpRequest();
      }
    } catch (_error) {
      e = _error;
      return console.error('catch: ', e);
    }
  };

  PlatformLoader.createUdpSocket = function(options) {
    var e, platform;
    platform = Platform.getPlatform();
    try {
      switch (platform.browser) {
        case 'ffos':
          return new FfosUdpSocket(options);
        case 'chrome_app':
          return new ChromeUdpSocket(options);
        default:
          return null;
      }
    } catch (_error) {
      e = _error;
      return console.error('catch: ', e);
    }
  };

  return PlatformLoader;

})();

module.exports = PlatformLoader;



},{"../common/Platform":2,"./chrome_app/ChromeUdpSocket":11,"./ffos/FfosUdpSocket":12}],11:[function(require,module,exports){
var ChromeUdpSocket, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

ChromeUdpSocket = (function(_super) {
  __extends(ChromeUdpSocket, _super);

  ChromeUdpSocket.ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  ChromeUdpSocket.str2ab = function(str) {
    var buf, bufView, i, _;
    buf = new ArrayBuffer(str.length);
    bufView = new Uint8Array(buf);
    for (i in str) {
      _ = str[i];
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  function ChromeUdpSocket(options) {
    this.options = options;
    this.localPort_ = options.localPort;
    this.loopback_ = options.loopback;
    this.socketId_ = -1;
    this._init();
  }

  ChromeUdpSocket.prototype._init = function() {
    var cb;
    cb = function(socketInfo) {
      return console.log('create socket: ', socketInfo.socketId);
    };
    return chrome.sockets.udp.create({}, cb);
  };

  ChromeUdpSocket.prototype._onMessage = function(data) {
    if (this.onPacketReceived) {
      return this.onPacketReceived(data);
    }
  };

  ChromeUdpSocket.prototype._onError = function(error) {
    if (this.onerror) {
      return this.onerror(error);
    }
  };

  ChromeUdpSocket.prototype.joinMulticastGroup = function(addr) {
    if (this.socketId_ === -1) {
      return this.once('ready', (function(_this) {
        return function() {
          return chrome.sockets.udp.joinGroup(_this.socketId_, addr, function(result) {
            return console.log('joinGroup UdpSocket: addr=', addr, ', result=', result);
          });
        };
      })(this));
    } else {
      return chrome.sockets.udp.joinGroup(this.socketId_, addr, (function(_this) {
        return function(result) {
          return console.log('joinGroup UdpSocket: addr=', addr, ', result=', result);
        };
      })(this));
    }
  };

  ChromeUdpSocket.prototype.send = function(data, addr, port) {
    var _data;
    if (!this.socketId_) {
      return;
    }
    _data = ChromeUdpSocket.str2ab(data);
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

  return ChromeUdpSocket;

})(EventEmitter);

module.exports = ChromeUdpSocket;



},{"eventemitter3":13}],12:[function(require,module,exports){
var EventEmitter, FfosUdpSocket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

FfosUdpSocket = (function(_super) {
  __extends(FfosUdpSocket, _super);

  function FfosUdpSocket(options) {
    this.options = options;
    this.localPort_ = options.localPort;
    this.loopback_ = options.loopback;
    this.socket_ = new UDPSocket(options);
    this.socket.onmessage = (function(_this) {
      return function(event) {
        var data;
        data = String.fromCharCode.apply(null, new Uint8Array(event.data));
        return _onMessage(data);
      };
    })(this);
  }

  FfosUdpSocket.prototype._onMessage = function(data) {
    if (this.onPacketReceived) {
      return this.onPacketReceived(data);
    }
  };

  FfosUdpSocket.prototype.joinMulticastGroup = function(addr) {
    var _ref;
    return (_ref = this.socket) != null ? _ref.joinMulticastGroup(addr) : void 0;
  };

  FfosUdpSocket.prototype.send = function(data, addr, port) {
    var _ref;
    return (_ref = this.socket) != null ? _ref.send(data, addr, port) : void 0;
  };

  return FfosUdpSocket;

})(EventEmitter);

module.exports = FfosUdpSocket;



},{"eventemitter3":13}],13:[function(require,module,exports){
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

},{}]},{},[5]);
