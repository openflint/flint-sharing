var deviceScanner = new FlintDeviceScanner();
var stream = null;
var device = null;

// app installed callback
chrome.runtime.onInstalled.addListener(function () {
    console.log('Flint Sharing installed!!!');
});

// app launched callback
chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create(
        'window.html',
        {
            'id': 'flint-sharing',
            'innerBounds': {
                'width': 600,
                'height': 800
            },
            'resizable': false
        },
        function (appWindow) {
            appWindow.onClosed.addListener(function () {
                console.log('window closed!');
                deviceScanner.stop();
            });

            console.log('create window ok: flint-sharing');
            chrome.runtime.onConnect.addListener(function (port) {
                console.log('port on connected in background');

                port.onMessage.addListener(function (msg) {
                    console.log('port: ', msg);
                    if (msg.type == 'stream') {
                        console.log('background get stream: ', msg.stream);
                        stream = msg.stream;
                    } else if (msg.type == 'device') {
                        console.log('background get device: ', msg.device);
                        device = msg.device;
                    }
                });

                deviceScanner.on('devicefound', function (device) {
                    console.log('background found: ', device);
                    port.postMessage({
                        type: 'devicefound',
                        device: device.toJson()
                    });
                });

                deviceScanner.on('devicegone', function (device) {
                    port.postMessage({
                        type: 'devicegone',
                        device: device
                    });
                });

                deviceScanner.start();

                port.postMessage({
                    type: 'ready'
                });
            });
        }
    );
});

// background unload callback
chrome.runtime.onSuspend.addListener(function () {
    console.log('background suspend!!!');
});