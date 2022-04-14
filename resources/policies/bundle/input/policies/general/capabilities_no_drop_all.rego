package appshield.kubernetes.KSV003

import data.appshield.kubernetes.KSV003.deny

import data.lib.kubernetes

default checkCapsDropAll = false

__rego_metadata__ := {
	"id": "KSV003",
	"avd_id": "AVD-KSV-0003",
	"title": "Default capabilities not dropped",
	"short_code": "drop-default-capabilities",
	"version": "v1.0.0",
	"severity": "LOW",
	"type": "Kubernetes Security Check",
	"description": "The container should drop all default capabilities and add only those that are needed for its execution.",
	"recommended_actions": "Add 'ALL' to containers[].securityContext.capabilities.drop.",
	"url": "https://kubesec.io/basics/containers-securitycontext-capabilities-drop-index-all/",
}

__rego_input__ := {
	"combine": false,
	"selector": [{"type": "kubernetes"}],
}

# Get all containers which include 'ALL' in security.capabilities.drop
getCapsDropAllContainers[container] {
	allContainers := kubernetes.containers[_]
	allContainers.securityContext.capabilities.drop[_] == "ALL"
	container := allContainers.name
}

# Get all containers which don't include 'ALL' in security.capabilities.drop
getCapsNoDropAllContainers[container] {
	container := kubernetes.containers[_].name
	not getCapsDropAllContainers[container]
}

# checkCapsDropAll is true if capabilities drop does not include 'ALL',
# or if capabilities drop is not specified at all.
checkCapsDropAll {
	count(getCapsNoDropAllContainers) > 0
}
