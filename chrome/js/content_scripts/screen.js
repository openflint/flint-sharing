// chrome cannot capture tab
var sources = ['screen', 'window', /* 'tab' */];

function getScreenConstraints(sourceId) {
    var screen_constraints = {
        audio: false, // if true will got 'NavigatorUserMediaError'
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
            },
            optional: []
        }
    };

    if (sourceId) {
        screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
    }

    return screen_constraints;
}

function getStream(callback) {
    chrome.desktopCapture.chooseDesktopMedia(sources, function (sourceId) {
        if (sourceId != null) {
            console.log('get sourceId: ', sourceId);

            navigator.getUserMedia = navigator.webkitGetUserMedia;
            if (!navigator.getUserMedia) {
                callback('null getUserMedia', null);
                return;
            }

            var screen_constraints = getScreenConstraints(sourceId);
//            console.log('screen_constraints:\n', screen_constraints);

            navigator.getUserMedia(screen_constraints, function (stream) {
                console.log("get media stream!");
                callback(null, stream);
            }, function (error) {
                console.error('get media error: ', error);
                callback(error, null);
            });
        } else {
            console.warn('get sourceId: null!');
        }
    });
}
