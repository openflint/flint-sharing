#!/bin/sh

# chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension="./chrome"
mv chrome.crx release/chrome/flint-sharing.crx
mv chrome.pem release/chrome/flint-sharing.pem

# firefox
cd firefox
jpm xpi
rm ../release/firefox/flint-sharing.xpi
mv @flint-sharing.xpi ../release/firefox/flint-sharing.xpi
