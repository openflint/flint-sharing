var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;

const { FlintDeviceManager } = require('./lib/discovery/FlintDeviceManager');
const { Enabler } = require('./lib/Enabler');

var button = buttons.ActionButton({
    id: 'flint-sharing',
    label: 'Flint Sharing',
    icon: {
        '16': './img/icon-16.png',
        '32': './img/icon-32.png',
        '64': './img/icon-64.png'
    },
    onClick: launchAddon
});

var enabler = Enabler();
var deviceManager = null;
var pageWorker = null;

function launchAddon(state) {
    console.log(FlintDeviceManager);

    tabs.open({
//        url: data.url('index.html'),
        url: 'https://openflint.github.io/flint-sharing/firefox/data/index.html',
        onOpen: function (tab) {
            console.log('tab is open!!!');
            _onOpen();
        },
        onReady: function (tab) {
            console.log('tab is ready!!!');

            if (deviceManager != null) {
                console.log('deviceManager is not null!!! close it!!!');
                tab.close(function() {
                    console.log('deviceManager is not null!!! close it!!! done');
                });
                return;
            }

            pageWorker = tab.attach({
                contentScriptFile: [
                    data.url('js/flint_sender_sdk.js'),
                    data.url('js/getScreenId.js'),
                    data.url('js/jquery.min.js'),
                    data.url('js/app.js')
                ]
            });

            _onReady();
        },
        onClose: function (tab) {
            console.warn('tab is close!!!');

            _onClose();
        }
    });
}

function _onOpen() {
}

function _onReady() {
    enabler.setup();

    deviceManager = FlintDeviceManager();

    deviceManager.on('devicefound', function (device) {
        pageWorker.port.emit('devicefound', device);
    });

    deviceManager.on('devicelost', function (device) {
        pageWorker.port.emit('devicelost', device);
    });

    pageWorker.port.on('scan', function () {
        console.log('start scan device!!!');
        deviceManager.start();
    });

    pageWorker.port.on('share', function (serviceUrl, appInfo) {
    });
}

function _onClose() {
    enabler.revert();

    deviceManager.stop();
}