#!/bin/sh

grunt

# browser-extension
source /Users/manson/work/browser-extensions/python-env/bin/activate

forge-extension build $1
forge-extension package $1
