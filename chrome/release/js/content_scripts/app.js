console.log("############ #########");
console.log("######@@@", chrome.sockets);
console.log("############ #########");

//var port = chrome.runtime.connect();

getStream(function (error, stream) {
    if (error != null) {
        console.error("app: capture error, ", error);
    } else {
        console.log("app: capture stream ok!");
        share(stream);
    }
});

function share(stream) {
    var appInfo = {
        appUrl: 'https://openflint.github.io/flint-sharing/data/screen_receiver.html',
        useIpc: true,
        maxInactive: -1
    };

    var senderManager = new FlintSenderManager('~a3ad1b9e-6883-11e4-b116-123b93f75cba', 'http://127.0.0.1:9431', true);
    senderManager.launch(appInfo, function (result, token) {
        if (result) {
            console.log('Application is launched ! OK!!! -> ' + token);
            senderManager.callReceiverMediaPeer(stream);
            senderManager.on('appstate', function (_, state, additionaldata) {
                if (state == 'stopped') {
                    stream.stop();
                    console.log('Receiver application is stopped!!!');
                }
            });
        }
        else {
            console.log('Application is launched ! failed!!!');
        }
    });
}