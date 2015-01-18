console.log('FlintSharing luanched!');

/**

console.log('FlintSharing send command: scan');
self.port.emit("scan");

self.port.on('devicefound', function (device) {
    console.log('find new device: ', device.deviceName);
});

self.port.on('devicelost', function (device) {
    console.log('lost device: ', device.deviceName);
});

 */

// Screen stream
var localStream = null;

var screen_constraints = {
    "audio": false,
    "video": true
};

var appInfo = {
    appUrl: 'https://openflint.github.io/screen-sharing-sample/screen_viewer.html',
    useIpc: true,
    maxInactive: -1
};

// share camera

//var senderManager = new FlintSenderManager('~a3ad1b9e-6883-11e4-b116-123b93f75cba', 'http://127.0.0.1:9431', true);
//senderManager.launch(appInfo, function (result, token) {
//    if (result) {
//        console.log('Application is launched ! OK!!! -> ' + token);
//        navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
//        navigator.getUserMedia(screen_constraints, function (stream) {
//            console.log("Received camera stream.");
//
//            localStream = stream;
//            var peer = senderManager.callReceiverMediaPeer(stream);
//
//            stream.onended = function () {
//                log("screen stream ended.");
//                peer.destroy();
//            };
//        }, function (error) {
//            console.error(error);
//        });
//    }
//    else {
//        log('Application is launched ! failed!!!');
//    }
//});


// share screen
getScreenId(function (error, sourceId, screen_constraints) {

    console.log(error);
    console.log(sourceId);
    console.log(screen_constraints);

    // Firefox
    if (!!navigator.mozGetUserMedia) {
        screen_constraints = {
            "audio": false,
            "video": {
                "mozMediaSource": "window",
                "mediaSource": "window",
                "maxWidth": 1920,
                "maxHeight": 1080,
                "minAspectRatio": 1.77
            }
        };
    }

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(screen_constraints, function (stream) {

        console.log("Received screen stream.");

        localStream = stream;

        senderManager.setServiceUrl(device.getUrlBase());
        senderManager.launch(appInfo, function (result, token) {
            if (result) {
                console.log('Application is launched ! OK!!! -> ' + token);
                senderManager.callReceiverMediaPeer(localStream);
            }
            else {
                console.log('Application is launched ! failed!!!');
            }
        });
    }, function (error) {
        console.error('get media error: ', error);
    });
});