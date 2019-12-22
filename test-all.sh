#!/bin/sh

SCRIPT_PATH=`dirname $0`
$SCRIPT_PATH/node_modules/.bin/nodeunit `find ${SCRIPT_PATH}/tests/unit -name "*.test.js"`
