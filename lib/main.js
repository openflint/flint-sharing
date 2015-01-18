var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;

const { DeviceManager } = require('./DeviceManager');
const { Enabler } = require('./Enabler');

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

var deviceManager = null;
var pageWorker = null;

function launchAddon(state) {
    tabs.open({
//        url: data.url('index.html'),
        url: 'http://localhost:8080/webrtc/screen.html',
        onOpen: function (tab) {
            console.log('tab is open!!!');
        },
        onReady: function (tab) {
            console.log('tab is ready!!!');

            pageWorker = tab.attach({
                contentScriptFile: [
//                    data.url('js/flint_sender_sdk.js'),
//                    data.url('js/jquery.min.js'),
//                    data.url('js/getScreenId.js'),
//                    data.url('js/app.js')
                ]
            });

            onReady();

            let enabler = Enabler();
            enabler.startup();
        },

        onClose: function (tab) {
            console.warn('tab is close!!!');
            if (deviceManager != null) {
                deviceManager.stop();
            }
        }
    });
}

function onReady() {
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