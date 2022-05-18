/**
 * Image found in K8sResource refs
 */

interface DockerImage {
  id: string;
  name: string;
  tag: string;
  resourcesIds: string[];
}

export type {DockerImage};
