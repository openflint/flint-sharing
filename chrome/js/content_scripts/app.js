console.log("Flint Sharing app run!!!");

String.prototype.replaceAll = function (AFindText,ARepText){
    raRegExp = new RegExp(AFindText,"g");
    return this.replace(raRegExp,ARepText);
}
String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

function hasClass(e, cls) { 
    return e.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')); 
};
function addClass(e, cls) { 
    if(!hasClass(e, cls)){
        e.className = e.className.trim();
        e.className += " "+cls; 
    }
    return this;
};
function removeClass(e, cls) { 
    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)'); 
    e.className = e.className.replace(reg,' '); 
    return this;
}; 

const appInfo = {
    appUrl: 'https://openflint.github.io/flint-sharing/receiver/screen_receiver.html',
    useIpc: true,
    maxInactive: -1
};

var devices = {},
    sharing = false,

    shareBtn = null, 
    stopBtn = null,
    
    domNodevice = null,
    domDevices = null,
    domDeviceSelectors = null,
    domTempDevice = null,
    currDevice = null,
    wStream = null,
    senderManager = null;

var port = chrome.runtime.connect();

function bindSelectorEvent(){
    var dlist = document.querySelectorAll("#selector li");
    for(var i=0; i<dlist.length; i++){
        dlist[i].onclick = function(){
            var did = this.getAttribute("device_id");
            if(!hasClass(this, "active")){
                addClass(this, "active");
                currDevice = {
                    "id": this.getAttribute("device_id"),
                    "name": this.getAttribute("device_name")};
                for (var i = dlist.length - 1; i >= 0; i--) {
                    if(dlist[i]==this){
                        continue;
                    }else{
                        removeClass(dlist[i], "active");
                    }
                };
            }
        };
    }
}

port.onMessage.addListener(function (msg) {
    console.log('port: ', msg);
    if (msg.type == 'devicefound') {
        var device = msg.device;
        var uniqueId = device.uniqueId,
            temp = domTempDevice.innerHTML;

        console.log('find new device: ', device);
        addClass(domNodevice, "hide");
        removeClass(domDevices, "hide");

        domDeviceSelectors.innerHTML+= temp.replaceAll("##device_id##", device.uniqueId).
            replaceAll("##device_name##", device.deviceName).
            replaceAll("##device_ip##", device.host);

        bindSelectorEvent();
        devices[uniqueId] = device;

    } else if (msg.type == 'devicegone') {
        var device = msg.device;
        console.log('lost device: ', device.deviceName);
    } else if (msg.type == 'ready') {
        ready();
    }
});

function ready() {
    domDeviceSelectors = document.querySelector("#selector");
    domTempDevice = document.querySelector("#temp-device");
    domNodevice = document.querySelector("#nodevice");
    domDevices = document.querySelector("#devices");

    shareBtn = document.querySelector("#share");
    stopBtn = document.querySelector("#stop");

    shareBtn.onclick = function () {
        if(hasClass(this, "active")){
            return;
        }
        addClass(this, "active");
        if (sharing) {
            // todo
            console.info('@@@@@@@@@@@@alert: Already sharing!!!');
            removeClass(this, "active");
            return;
        }
        sharing = true;

        if (!currDevice) {
            console.info("@@@@@@@@@@@@alert: Please select a device");
            removeClass(this, "active");

        } else {
            console.log('select device: ', currDevice["id"], ', text = ', currDevice["name"]);

            getStream(function (error, stream) {
                wStream = stream;
                if (error != null) {
                    console.error('app get stream error: ', error);
                }
                port.postMessage({
                    type: 'stream',
                    stream: wStream
                });

                port.postMessage({
                    type: 'device',
                    device: devices[currDevice["id"]]
                });

                var options = {
                    appId: '~a3ad1b9e-6883-11e4-b116-123b93f75cba',
                    urlBase: devices[currDevice["id"]].urlBase,
                    host: devices[currDevice["id"]].host,
                    useHeartbeat: true
                };
                senderManager = new FlintSenderManager(options);
                
                senderManager.launch(appInfo, function (result, token) {
                    if (result) {
                        console.log('Application is launched ! OK!!! -> ' + token);
                        senderManager.callReceiverMediaPeer(wStream);
                        senderManager.on('appstate', function (_, state, additionaldata) {
                            if (state == 'stopped') {
                                sharing = false;
                                wStream.stop();
                                wStream = null;

                                removeClass(shareBtn, "hide");
                                addClass(stopBtn, "hide");
                                console.log('Receiver application is stopped!!!');
                            }
                        });

                        addClass(shareBtn, "hide");
                        removeClass(stopBtn, "hide");
                    } else {
                        console.log('Application is launched ! failed!!!');
                    }
                    removeClass(shareBtn, "active");
                });
                chrome.app.window.current().onClosed.addListener(function () {
                    sharing = false;
                    if (wStream != null) {
                        wStream.stop();
                        wStream = null;
                    }
                    senderManager.stop(appInfo);
                    senderManager = null;
                });
            });
        }
    };

    stopBtn.onclick = function () {
        if (!sharing) {
            console.info('@@@@@@@@@@@@alert: Not sharing!!!');
            return;
        }
        sharing = false;
        if (wStream != null) {
            wStream.stop();
            wStream = null;
        }
        senderManager.stop(appInfo);
        senderManager = null;
        removeClass(shareBtn, "hide");
        addClass(stopBtn, "hide");
    };
}
