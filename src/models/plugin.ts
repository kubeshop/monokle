interface MonoklePlugin {
  name: string;
  description: string;
  version: string;
  owner: string;
  repository: {
    name: string;
    url: string;
  };
  isActive: boolean;
}

export type {MonoklePlugin};
