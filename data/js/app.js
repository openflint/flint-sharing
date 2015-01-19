console.log('FlintSharing luanched!');

const appInfo = {
    appUrl: 'https://openflint.github.io/screen-sharing-sample/screen_viewer.html',
    useIpc: true,
    maxInactive: -1
};

var dlist = document.getElementById("dlist");

var share = document.getElementById("share");
share.onclick = function () {
    var options = dlist.options;
    var device = null;

    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.selected) {
            device = {
                "value": option.value,
                "text": option.textContent
            };
            break;
        }
    }

    if (!device) {
        alert("Please select a device");
    } else {
        // todo: start sharing
        console.log('select device: ', device.value, ', text = ', device.text);

        var senderManager = new FlintSenderManager('~a3ad1b9e-6883-11e4-b116-123b93f75cba', device.value, true);

        getScreenId(function (error, sourceId, screen_constraints) {
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
                senderManager.launch(appInfo, function (result, token) {
                    if (result) {
                        console.log('Application is launched ! OK!!! -> ' + token);
                        senderManager.callReceiverMediaPeer(stream);
                    }
                    else {
                        console.log('Application is launched ! failed!!!');
                    }
                });
            }, function (error) {
                console.error('get media error: ', error);
            });
        });

        var stopBtn = document.getElementById("stop");
        stopBtn.onclick = function() {
            senderManager.stop(appInfo);
        }
    }
};

console.log('FlintSharing send command: scan');
self.port.emit("scan");

self.port.on('devicefound', function (device) {
    console.log('find new device: ', device.deviceName);
    var ip = device.urlBase;
    dlist.innerHTML += '<option id="' + ip + '" value="' + ip + '">' + device.deviceName + '</option>';
});

self.port.on('devicelost', function (device) {
    console.log('lost device: ', device.deviceName);
});
