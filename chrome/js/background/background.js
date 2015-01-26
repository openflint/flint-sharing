var deviceScanner = new FlintDeviceScanner();

// app installed callback
//chrome.app.runtime.onInstalled.addListener(function () {
//
//});

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
            console.log('create window ok: flint-sharing');
            chrome.runtime.onConnect.addListener(function (port) {
                console.log('port on connected in background');
                deviceScanner.start();
            });
        }
    );
});

// app exit callback
//chrome.app.runtime.onSuspend.addListener(function () {
//
//});

// app window close callback
chrome.app.window.onClosed.addListener(function () {
    console.log('window close!');
    deviceScanner.stop();
});

