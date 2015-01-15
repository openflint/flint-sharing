var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;

const { SSDPResponder } = require('./ssdp/SSDPResponder');

const SSDP_DISCOVER_PACKET =
    "M-SEARCH * HTTP/1.1\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "MX: 2\r\n" +
    "ST: urn:dial-multiscreen-org:service:dial:1\r\n\r\n";

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
    tabs.open({
        url: data.url('index.html'),
        onOpen: function (tab) {
            console.log('tab is open!!!');
        },
        onReady: function (tab) {
            console.log('tab is ready!!!');

            var ssdp = SSDPResponder();
            ssdp.start();
        },
        onClose: function (tab) {
            console.warn('tab is close!!!');
        }
    });
}