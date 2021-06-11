#!/usr/bin/env bash

readonly SCRIPT=$(basename "$0")
readonly VERSION='1.0.0'
readonly AUTHOR='xy.kong@gmail.com'
readonly SOURCE='https://gist.github.com/xykong/6efdb1ed57535d18cb63aa8e20da3f4b'

# For script running robust
set -o nounset  # to exit when your script tries to use undeclared variables
set -o errexit  # to make your script exit when a command fails
set -o pipefail # to make your script exit when a command fails in pipe
# set -o xtrace # traces commands before executing them

echo "running: $0 $@"

function usage() {
    cat <<EOF
Export Kubernetes cluster resource to yaml.

  $SCRIPT, version $VERSION
  $AUTHOR, source $SOURCE

Usage:
  $SCRIPT [options]
  $SCRIPT -h | --help
  $SCRIPT --version

Options:
  -n --namespace <name>          Namespace in current cluster
  -o --output <directory>        Path to export (defalut is current working directory)
  -q --quiet                     Do not display log messages.
  -r --resource <name>           Export one or more resources by their type and names.
  -t --timestamp                 Append time stamp to folder name, format: date '+%Y-%m-%d_%H-%M-%S'
  -h --help                      Show this screen.
  --version                      Show version.


EOF
}

function parse_options() {

    # Option parsing
    while [[ $# -gt 0 ]]; do
        case "$1" in
        -h | --help)
            usage
            exit 0
            ;;
        --version)
            printf "%s\n" $VERSION
            exit 0
            ;;
        -n | --namespace)
            opt_namespace="$2"
            shift
            ;;
        -o | --output)
            opt_output="$2"
            shift
            ;;
        -r | --resource)
            opt_resource="$2"
            shift
            ;;
        -t | --timestamp)
            opt_timestamp=true
            ;;
        *)
            (printf >&2 "Unknown parameter: %s\n" "$1")
            usage
            exit 1
            ;;
        esac
        shift
    done
}

function dump_all() {

    ROOT=${opt_output}/k8sdumps
    if [ ! -z ${opt_timestamp+x} ]; then
        ROOT="${ROOT}_$(date '+%Y-%m-%d_%H-%M-%S')"
    fi
    while read -r resource; do
        echo "  scanning resource '${resource}'"
        while read -r namespace item x; do
            mkdir -p "${ROOT}/${namespace}/${resource}"
            echo "    exporting item '${namespace} ${item}'"
            kubectl get "$resource" -n "$namespace" "$item" -o yaml >"${ROOT}/${namespace}/${resource}/$item.yaml" &
        done < <(kubectl get "$resource" --all-namespaces 2>&1 | tail -n +2 | grep "^$opt_namespace")
    done < <(echo "$opt_resource")

    wait
}

parse_options $@

# get all resource if not set
if [ -z ${opt_resource+x} ]; then
    opt_resource=$(kubectl api-resources --namespaced=true 2>/dev/null | grep -v "events" | tail -n +2 | awk '{print $1}')
fi

# get all namespace if not set
if [ -z ${opt_namespace+x} ]; then
    opt_namespace=""
fi

# if not set output, then output current folder
if [ -z ${opt_output+x} ]; then
    opt_output="."
fi

dump_all
