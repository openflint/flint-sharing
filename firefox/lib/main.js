var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;

const { DeviceManager } = require('./DeviceManager');
const { Enabler } = require('./Enabler');

//const { FlintDeviceScanner } = require('./sdk/flint_discovery');
const { ExportTest } = require('./sdk/ExportTest');
const { SubTest } = require('./sdk/sub/SubTest');

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
    console.error('------------');
    console.error('ExportTest------------', ExportTest);
    console.error('SubText------------', SubTest);
    var t = new SubTest();
    t.logSub();
    t.log();
    console.error('------------');
    tabs.open({
//        url: data.url('index.html'),
        url: 'https://openflint.github.io/flint-sharing/firefox/data/index.html',
        onOpen: function (tab) {
            console.log('tab is open!!!');

            _onOpen();
        },
        onReady: function (tab) {
            console.log('tab is ready!!!');

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

    deviceManager = DeviceManager();

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