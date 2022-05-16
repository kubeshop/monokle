/**
 * Image found in K8sResource refs
 */

interface DockerImage {
  name: string;
  tag: string;
  resourcesIds: string[];
}

export type {DockerImage};
