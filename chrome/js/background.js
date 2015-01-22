// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function (tab) {
//    var url = chrome.extension.getURL('../index.html');
    var url = 'https://openflint.github.io/flint-sharing/chrome/index.html';
    console.log('url = ', url);
    chrome.tabs.create({ url: url });
});