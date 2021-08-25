function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }
CONTENTS="$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")")/.."
MONOKLE="$CONTENTS/MacOS/Monokle"
CLI="$CONTENTS/Resources/app/cli/index.js"

PASSED=$1

if [[ $PASSED = /* ]]; then
    if [[ -d "$(pwd)$PASSED" ]]; then
        MONOKLE_RUN_AS_NODE=1 "$MONOKLE" "$CLI" --executed-from="$(pwd)" "$@" &>/dev/null &
        disown
        exit $?
    else
        echo "The requested path is not a valid directory"
        exit 1
    fi
else
    if [[ -d "$(pwd)/$PASSED" ]]; then
        MONOKLE_RUN_AS_NODE=1 "$MONOKLE" "$CLI" --executed-from="$(pwd)" "$@" &>/dev/null &
        disown
        exit $?
    else
        echo "The requested path is not a valid directory"
        exit 1
    fi
fi
