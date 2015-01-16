var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;

const { DeviceManager } = require('./DeviceManager');

var button = buttons.ActionButton({
    id: 'flint-sharing',
    label: 'Flint Sharing',
    icon: {
        '16': './img/icon-16.png',
        '32': './img/icon-32.png',
        '64': './img/icon-64.png'
    },
    onClick: handleClick
});

function handleClick(state) {
    var deviceManager = DeviceManager();

    tabs.open({
        url: data.url('index.html'),
        onOpen: function (tab) {
            console.log('tab is open!!!');
        },
        onReady: function (tab) {
            console.log('tab is ready!!!');
            deviceManager.start();
        },
        onClose: function (tab) {
            console.warn('tab is close!!!');
            deviceManager.stop();
        }
    });
}