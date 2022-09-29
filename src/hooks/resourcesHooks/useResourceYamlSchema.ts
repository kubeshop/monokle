import {useEffect} from 'react';

import {languages} from 'monaco-editor/esm/vs/editor/editor.api';

import {FileMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {hasSupportedResourceContent} from '@redux/services/resource';
import {getResourceSchema, getSchemaForPath} from '@redux/services/schema';

function useResourceYamlSchema(
  yaml: typeof languages.yaml,
  userDataDir: string,
  k8sVersion: string,
  resource?: K8sResource,
  selectedPath?: string,
  fileMap?: FileMapType
) {
  useEffect(() => {
    if (!resource && !selectedPath) {
      yaml &&
        yaml.yamlDefaults.setDiagnosticsOptions({
          validate: false,
        });
      return;
    }

    let resourceSchema;
    let validate = true;

    if (resource) {
      resourceSchema = getResourceSchema(resource, k8sVersion, userDataDir);
      validate = resourceSchema && !isKustomizationPatch(resource) && hasSupportedResourceContent(resource);
    } else if (selectedPath && fileMap) {
      resourceSchema = getSchemaForPath(selectedPath, fileMap);
      validate = resourceSchema !== undefined;
    }

    yaml &&
      yaml.yamlDefaults.setDiagnosticsOptions({
        validate,
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        isKubernetes: Boolean(resource),
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
  }, [resource, selectedPath, fileMap, k8sVersion]);
}

export default useResourceYamlSchema;
