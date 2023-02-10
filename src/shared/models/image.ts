/**
 * Image found in K8sResource refs
 */

type ImageType = {
  id: string;
  name: string;
  tag: string;
  resourcesIds: string[];
};

/**
 * Docker Hub Image info
 */

type DockerHubImage = {
  user: string;
  name: string;
  namespace: string;
  repository_type: string;
  status: number;
  description: string;
  is_private: boolean;
  is_automated: boolean;
  can_edit: boolean;
  star_count: number;
  pull_count: number;
  last_updated: Date;
  is_migrated: boolean;
  collaborator_count: number;
  hub_user: string;
  has_starred: boolean;
  full_description: string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
};

type DockerHubTagImage = {
  architecture: string;
  features: string;
  variant: string | null;
  digest: string;
  os: string;
  os_features: string;
  os_version: string | null;
  size: number;
  status: string;
  last_pulled: Date;
  last_pushed: Date;
};

type DockerHubImageTag = {
  creator: number;
  id: number;
  image_id: number | null;
  images: DockerHubTagImage[];
  last_updated: Date;
  last_updater: number;
  last_updater_username: string;
  name: string;
  repository: number;
  full_size: number;
  v2: boolean;
  tag_status: string;
  tag_last_pulled: Date;
  tag_last_pushed: Date;
};

type DockerHubImageTags = {
  count: number;
  next: string | null;
  previous: string | null;
  results: DockerHubImageTag[];
};

export type {DockerHubImage, DockerHubImageTag, DockerHubImageTags, ImageType};
