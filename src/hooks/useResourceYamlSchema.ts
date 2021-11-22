import {useEffect} from 'react';

import {ResourceMapType} from '@models/appstate';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {getResourceSchema} from '@redux/services/schema';

function useResourceYamlSchema(yaml: any, resourceMap: ResourceMapType, resourceId: string | undefined) {
  useEffect(() => {
    let resourceSchema;
    let validate = true;

    if (resourceId) {
      const resource = resourceMap[resourceId];
      if (resource) {
        resourceSchema = getResourceSchema(resource);
        validate = !isKustomizationPatch(resource);
      }
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
  }, [resourceId, resourceMap]);
}

export default useResourceYamlSchema;
