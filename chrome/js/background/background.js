var stream = null;
var port_ = null;

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
                'height': 500,
                'minHeight': 400,
                'maxHeight': 600
            },
            'resizable': true
        },
        function (appWindow) {
            var deviceManager = new FlintDeviceManager();

//            appWindow.onClosed.addListener(function () {
//                console.log('window closed!');
//                deviceManager.stop();
//                port_.disconnect();
//            });

            console.log('create window ok: flint-sharing');
            chrome.runtime.onConnect.addListener(function (port) {
                console.log('port on connected in background');
                port_ = port;

                appWindow.onClosed.addListener(function() {
                    console.log('window closed!');
                    deviceManager.stop();
                    port.disconnect();
                });

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

                deviceManager.on('devicefound', function (device) {
                    console.log('background found: ', device);
                    port.postMessage({
                        type: 'devicefound',
                        device: device
                    });
                });

                deviceManager.on('devicegone', function (device) {
                    port.postMessage({
                        type: 'devicegone',
                        device: device
                    });
                });

                deviceManager.start();

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