#!/bin/sh

# chrome
#rm release/flint-sharing.crx
#zip -q -r release/flint-sharing.crx chrome

# firefox
cd firefox
jpm xpi
rm ../release/firefox/flint-sharing.xpi
mv @flint-sharing.xpi ../release/firefox/flint-sharing.xpi
