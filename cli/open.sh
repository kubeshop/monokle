#!/bin/bash
APP_NAME="monokle"
APP="$APP_NAME.app"
BUNDLE_IDENTIFIER="io.kubeshop.monokle"

if [ "$(uname)" == 'Darwin' ]; then
    OS='Mac'
else
    echo "Your platform ($(uname -a)) is not supported."
    exit 1
fi

while getopts ":hv-:" opt; do
    case "$opt" in
    -)
        case "${OPTARG}" in
        help | version)
            EXPECT_OUTPUT=1
            REDIRECT_STDERR=1
            ;;
        esac
        ;;
    h | v)
        EXPECT_OUTPUT=1
        REDIRECT_STDERR=1
        ;;
    esac
done

if [ $REDIRECT_STDERR ]; then
    exec 2>/dev/null
fi

if [ -z "${APP_PATH}" ]; then
    if [ -x "/Applications/$APP" ]; then
        APP_PATH="/Applications"
    elif [ -x "$HOME/Applications/$APP_PATH" ]; then
        APP_PATH="$HOME/Applications"
    else
        APP_PATH="$(mdfind "kMDItemCFBundleIdentifier == $BUNDLE_IDENTIFIER" | grep -v ShipIt | head -1 | xargs -0 dirname)"

        # Exit if APP can't be found
        if [ ! -x "$APP_PATH/$APP" ]; then
            echo "Cannot locate $APP, it is usually located in /Applications."
            exit 1
        fi
    fi
fi

if [ $EXPECT_OUTPUT ]; then
    "$APP_PATH/$APP/Contents/MacOS/$APP_NAME" --executed-from="$(pwd)" "$@"
    exit $?
else
    open -a "$APP_PATH/$APP" -n --args --executed-from="$(pwd)" "$@"
fi
