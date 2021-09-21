import {ResourceMapType} from '@models/appstate';
import {useEffect} from 'react';
import {getResourceSchema} from '@redux/services/schema';

function useResourceYamlSchema(yaml: any, resourceMap: ResourceMapType, selectedResourceId: string | undefined) {
  useEffect(() => {
    let resourceSchema;

    if (selectedResourceId) {
      const resource = resourceMap[selectedResourceId];
      if (resource) {
        resourceSchema = getResourceSchema(resource);
      }
    }

    yaml &&
      yaml.yamlDefaults.setDiagnosticsOptions({
        validate: true,
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
