/**
 * Image found in K8sResource refs
 */

interface ImageType {
  id: string;
  name: string;
  tag: string;
  resourcesIds: string[];
}

export type {ImageType};
