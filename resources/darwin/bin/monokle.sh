function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }
CONTENTS="$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")")/.."
MONOKLE="$CONTENTS/MacOS/Monokle"
CLI="$CONTENTS/Resources/app/cli/index.js"

PASSED=$1

if [ -z $PASSED ]; then
    ABSOLUTE_PATH=""
elif [[ $PASSED = /* ]]; then
    ABSOLUTE_PATH=$PASSED
else
    ABSOLUTE_PATH="$(pwd)/$PASSED"
fi

if [[ -d "$ABSOLUTE_PATH" ]]; then
    MONOKLE_RUN_AS_NODE=1 "$MONOKLE" "$CLI" --executed-from="$ABSOLUTE_PATH" "$@" &>/dev/null &
    disown
    exit $?
else
    echo "The requested path is not a valid directory"
    exit 1
fi
