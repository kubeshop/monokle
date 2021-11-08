import {ResourceMapType} from '@models/appstate';
import {useEffect} from 'react';
import {getResourceSchema} from '@redux/services/schema';
import {isKustomizationPatch} from '@redux/services/kustomize';

function useResourceYamlSchema(yaml: any, resourceMap: ResourceMapType, selectedResourceId: string | undefined) {
  useEffect(() => {
    let resourceSchema;
    let validate = true;

    if (selectedResourceId) {
      const resource = resourceMap[selectedResourceId];
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
  }, [selectedResourceId, resourceMap]);
}

export default useResourceYamlSchema;
