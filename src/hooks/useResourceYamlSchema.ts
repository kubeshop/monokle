import {ipcRenderer} from 'electron';

import {useEffect} from 'react';

import {languages} from 'monaco-editor/esm/vs/editor/editor.api';

import {FileMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {hasSupportedResourceContent} from '@redux/services/resource';
import {getResourceSchema, getSchemaForPath} from '@redux/services/schema';

import {getResourceKindHandler} from '@src/kindhandlers';

function setLocalSchemaContent(name: string, resourceSchema: any) {
  if (name.startsWith('/')) {
    name = name.substring(1);
  }
  const schemaPath = `/schemas/${name}.json`;
  ipcRenderer.send('add-local-server-content', {
    path: schemaPath,
    content: JSON.stringify(resourceSchema || {}, null, 2),
  });
  return `http://localhost:51038${schemaPath}`;
}

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
    let resourceKindHandler: ResourceKindHandler | undefined;

    if (resource) {
      resourceSchema = getResourceSchema(resource, k8sVersion, userDataDir);
      validate = resourceSchema && !isKustomizationPatch(resource) && hasSupportedResourceContent(resource);
      resourceKindHandler = getResourceKindHandler(resource.kind);
    } else if (selectedPath && fileMap) {
      resourceSchema = getSchemaForPath(selectedPath, fileMap);
      validate = resourceSchema !== undefined;
    }

    if (yaml) {
      let schemaUri = '';

      if (resource) {
        // if this is a custom resource then host the schema using the local server
        if (resourceKindHandler && resourceKindHandler.isCustom) {
          schemaUri = setLocalSchemaContent(resourceKindHandler.kind.toLowerCase(), resourceSchema);
        } else {
          // use public GitHub repo containing all schemas
          const standalone = resource?.kind === 'CustomResourceDefinition' ? '' : '-standalone';
          schemaUri = `https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v${k8sVersion}${standalone}/${resource?.kind.toLowerCase()}.json`;
        }
      }
      // for file-based schemas
      else if (resourceSchema && selectedPath) {
        schemaUri = setLocalSchemaContent(selectedPath, resourceSchema);
      } else {
        schemaUri = setLocalSchemaContent('empty', {});
      }

      yaml.yamlDefaults.setDiagnosticsOptions({
        validate,
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        isKubernetes: Boolean(resource),
        format: true,
        schemas: [
          {
            uri: schemaUri,
            fileMatch: ['*'], // associate with our model
            schema: resourceSchema || {},
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, selectedPath, fileMap, k8sVersion]);
}

export default useResourceYamlSchema;
