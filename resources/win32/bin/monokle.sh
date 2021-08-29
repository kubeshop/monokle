#!/usr/bin/env sh

if [ "$MONOKLE_WSL_DEBUG_INFO" = true ]; then
    set -x
fi

COMMIT="@@COMMIT@@"
APP_NAME="@@APPNAME@@"
QUALITY="@@QUALITY@@"
NAME="@@NAME@@"
DATAFOLDER="@@DATAFOLDER@@"
MONOKLE_PATH="$(dirname "$(dirname "$(realpath "$0")")")"
MONOKLE="$MONOKLE_PATH/$NAME.exe"

IN_WSL=false
if [ -n "$WSL_DISTRO_NAME" ]; then
    # $WSL_DISTRO_NAME is available since WSL builds 18362, also for WSL2
    IN_WSL=true
else
    WSL_BUILD=$(uname -r | sed -E 's/^[0-9.]+-([0-9]+)-Microsoft.*|.*/\1/')
    if [ -n "$WSL_BUILD" ]; then
        if [ "$WSL_BUILD" -ge 17063 ]; then
            # WSLPATH is available since WSL build 17046
            # WSLENV is available since WSL build 17063
            IN_WSL=true
        else
            # If running under older WSL, don't pass cli.js to Electron as
            # environment vars cannot be transferred from WSL to Windows
            # See: https://github.com/microsoft/BashOnWindows/issues/1363
            #      https://github.com/microsoft/BashOnWindows/issues/1494
            "$MONOKLE" "$@"
            exit $?
        fi
    fi
fi
if [ $IN_WSL = true ]; then

    export WSLENV="MONOKLE_RUN_AS_NODE/w:$WSLENV"
    CLI=$(wslpath -m "$MONOKLE_PATH/resources/app/cli/index.js")

    # use the Remote WSL extension if installed
    WSL_EXT_ID="ms-vscode-remote.remote-wsl"

    MONOKLE_RUN_AS_NODE=1 "$MONOKLE" "$CLI" --locate-extension $WSL_EXT_ID >/tmp/remote-wsl-loc.txt 2>/dev/null </dev/null
    WSL_EXT_WLOC=$(cat /tmp/remote-wsl-loc.txt)

    if [ -n "$WSL_EXT_WLOC" ]; then
        # replace \r\n with \n in WSL_EXT_WLOC
        WSL_CODE=$(wslpath -u "${WSL_EXT_WLOC%%[[:cntrl:]]}")/scripts/wslCode.sh
        "$WSL_CODE" "$COMMIT" "$QUALITY" "$MONOKLE" "$APP_NAME" "$DATAFOLDER" "$@"
        exit $?
    fi

elif [ -x "$(command -v cygpath)" ]; then
    CLI=$(cygpath -m "$MONOKLE_PATH/resources/app/cli/index.js")
else
    CLI="$MONOKLE_PATH/resources/app/cli/index.js"
fi
MONOKLE_RUN_AS_NODE=1 "$MONOKLE" "$CLI" --executed-from="$(pwd)" "$@"
exit $?
