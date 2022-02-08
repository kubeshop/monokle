import {useEffect} from 'react';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';

import {isSupportedHelmResource} from '@redux/services/helm';
import {isKustomizationPatch} from '@redux/services/kustomize';
import {getResourceSchema} from '@redux/services/schema';

function useResourceYamlSchema(yaml: any, resource: K8sResource | undefined) {
  useEffect(() => {
    if (!resource) {
      yaml &&
        yaml.yamlDefaults.setDiagnosticsOptions({
          validate: false,
        });
      return;
    }

    let resourceSchema;
    let validate = true;

    if (resource) {
      resourceSchema = getResourceSchema(resource, PREDEFINED_K8S_VERSION);
      validate = !isKustomizationPatch(resource) && isSupportedHelmResource(resource);
    }

    yaml &&
      yaml.yamlDefaults.setDiagnosticsOptions({
        validate,
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        isKubernetes: true,
        format: true,
        schemas: [
          {
            uri: 'http://monokle/k8s.json', // id of the first schema
            fileMatch: ['*'], // associate with our model
            schema: resourceSchema || {},
          },
        ],
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);
}

export default useResourceYamlSchema;
