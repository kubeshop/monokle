package appshield.kubernetes.KSV018

import data.appshield.kubernetes.KSV018.deny

import data.lib.kubernetes
import data.lib.utils

default failLimitsMemory = false

__rego_metadata__ := {
	"id": "KSV018",
	"avd_id": "AVD-KSV-0018",
	"title": "Memory not limited",
	"short_code": "limit-memory",
	"version": "v1.0.0",
	"severity": "LOW",
	"type": "Kubernetes Security Check",
	"description": "Enforcing memory limits prevents DoS via resource exhaustion.",
	"recommended_actions": "Set a limit value under 'containers[].resources.limits.memory'.",
	"url": "https://kubesec.io/basics/containers-resources-limits-memory/",
}

__rego_input__ := {
	"combine": false,
	"selector": [{"type": "kubernetes"}],
}

# getLimitsMemoryContainers returns all containers which have set resources.limits.memory
getLimitsMemoryContainers[container] {
	allContainers := kubernetes.containers[_]
	utils.has_key(allContainers.resources.limits, "memory")
	container := allContainers.name
}

# getNoLimitsMemoryContainers returns all containers which have not set
# resources.limits.memory
getNoLimitsMemoryContainers[container] {
	container := kubernetes.containers[_].name
	not getLimitsMemoryContainers[container]
}

# failLimitsMemory is true if containers[].resources.limits.memory is not set
# for ANY container
failLimitsMemory {
	count(getNoLimitsMemoryContainers) > 0
}
