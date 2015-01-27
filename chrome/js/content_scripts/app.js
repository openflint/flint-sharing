console.log("Flint Sharing app run!!!");

const appInfo = {
    appUrl: 'https://openflint.github.io/flint-sharing/receiver/screen_receiver.html',
    useIpc: true,
    maxInactive: -1
};

var devices = {};
var sharing = false;
var dlist = null;
var share = null;


var port = chrome.runtime.connect();

port.onMessage.addListener(function (msg) {
    console.log('port: ', msg);
    if (msg.type == 'devicefound') {
        var device = msg.device;
        console.log('find new device: ', device.deviceName);
        var uniqueId = device.uniqueId;
        dlist.innerHTML += '<option id="' + uniqueId + '" value="' + uniqueId + '">' + device.deviceName + '</option>';
        devices[uniqueId] = device;
    } else if (msg.type == 'devicegone') {
        var device = msg.device;
        console.log('lost device: ', device.deviceName);
    } else if (msg.type == 'ready') {
        ready();
    }
});

function ready() {
    dlist = document.getElementById("dlist");
    share = document.getElementById("share");
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

            getStream(function (error, stream) {
                if (error != null) {
                    console.error('app get stream error: ', error);
                }
                var senderManager = new FlintSenderManager('~a3ad1b9e-6883-11e4-b116-123b93f75cba', devices[device.value], true);
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

                var stopBtn = document.getElementById("stop");
                stopBtn.onclick = function () {
                    if (!sharing) {
                        alert('Not sharing!!!');
                        return;
                    }
                    sharing = false;
                    if (stream != null) {
                        stream.stop();
                    }
                    senderManager.stop(appInfo);
                }
            });
        }
    };
}