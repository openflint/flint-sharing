#!/bin/sh

if [ $# != 1 ] ; then
    echo "      USAGE: $0 <platform>"
    echo "          e.g.: $0 [firefox, chrome, safari, ie]"
    exit 1;
fi

echo "build for platform: "$1
echo "------------"

echo "Begin grunt!!!"
grunt
echo "End grunt!!!"
echo "------------"

# browser-extension
echo "setup environment!!!"
source /Users/manson/work/browser-extensions/python-env/bin/activate

echo "Begin build!!!"
forge-extension build $1
echo "End build!!!"
echo "------------"

echo "Begin package!!!"
forge-extension package $1
echo "End package!!!"
echo "------------"

echo "All done!!!"
