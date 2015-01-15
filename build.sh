#!/bin/sh

echo "-- clean release --"
rm -rf release
mkdir release

echo "-- generate xpi --"
cfx xpi --output-file=release/FlintSharing.xpi

echo "-- All done! --"
