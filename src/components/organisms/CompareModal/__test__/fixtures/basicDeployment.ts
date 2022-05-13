import {v4} from 'uuid';

import {K8sResource} from '@models/k8sresource';

import {jsonToYaml} from '@utils/yaml';

import {faker} from '@faker-js/faker';

type Args = {
  name?: string;
  replicas?: number;
};

export function basicDeploymentFixture(args?: Args): K8sResource {
  const name = args?.name ?? faker.random.words(3).replaceAll(' ', '-');

  const deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name,
    },
    spec: {
      replicas: 2,
      selector: {
        matchLabels: {
          app: name,
        },
      },
      template: {
        metadata: {
          name,
          labels: {
            app: name,
          },
        },
        spec: {
          containers: [
            {
              name,
              image: 'nginx:1.14.2',
              ports: [
                {
                  containerPort: 80,
                },
              ],
            },
          ],
        },
      },
    },
  };

  return createK8sResource(deployment);
}

interface KubernetesObject {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
}

type CreateK8sResourceOptions = {
  id?: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  filePath?: string;
};

function createK8sResource(raw: KubernetesObject, options: CreateK8sResourceOptions = {}): K8sResource {
  const id = options.id ?? v4();
  return {
    id,
    version: raw.apiVersion,
    kind: raw.kind,
    name: raw.metadata.name,
    content: raw,
    text: jsonToYaml(raw),
    isHighlighted: options.isHighlighted ?? false,
    isSelected: options.isSelected ?? false,
    filePath: `unsaved://${id}`, // fixme
  };
}
