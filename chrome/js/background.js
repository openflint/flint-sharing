// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function (tab) {
//    var url = chrome.extension.getURL('../index.html');
//    console.log('url = ', url);
    console.log('url = ', 'https://openflint.github.io/flint-sharing/chrome/index.html');
    chrome.tabs.create({ url: url });
});