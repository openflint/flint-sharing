console.log("Flint Sharing app run!!!");

const appInfo = {
    appUrl: 'https://openflint.github.io/flint-sharing/receiver/screen_receiver.html',
    useIpc: true,
    maxInactive: -1
};

var devices = {};
var sharing = false;

var dlist = document.getElementById("dlist");

var share = document.getElementById("share");
share.onclick = function () {
    if (sharing) {
        alert('Already sharing!!!');
        return;
    }

    sharing = true;

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
        console.log('select device: ', device.value, ', text = ', device.text);

        var _stream = null;
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
                _stream = stream;
                senderManager.launch(appInfo, function (result, token) {
                    if (result) {
                        console.log('Application is launched ! OK!!! -> ' + token);
                        senderManager.callReceiverMediaPeer(stream);
                        senderManager.on('appstate', function (_, state, additionaldata) {
                            if (state == 'stopped') {
                                sharing = false;
                                stream.stop();
                                console.log('Receiver application is stopped!!!');
                            }
                        });
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
        stopBtn.onclick = function () {
            if (!sharing) {
                alert('Not sharing!!!');
                return;
            }
            sharing = false;
            if (_stream != null) {
                _stream.stop();
            }
            senderManager.stop(appInfo);
        }
    }
};

var port = chrome.runtime.connect();

port.on('devicefound', function (device) {
    console.log('find new device: ', device.deviceName);
    var uniqueId = device.uniqueId;
    dlist.innerHTML += '<option id="' + uniqueId + '" value="' + uniqueId + '">' + device.deviceName + '</option>';
    devices[uniqueId] = device;
});

port.on('devicelost', function (device) {
    console.log('lost device: ', device.deviceName);
});
