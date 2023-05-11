import {useEffect} from 'react';

import {setDiagnosticsOptions} from 'monaco-yaml';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {isSupportedResource} from '@redux/services/resource';
import {getResourceSchema, getSchemaForPath} from '@redux/services/schema';

import {FileMapType} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';

function useResourceYamlSchema(
  userDataDir: string,
  k8sVersion: string,
  selectedResourceId?: string,
  selectedResourceRef?: React.MutableRefObject<K8sResource | undefined>,
  selectedPath?: string,
  fileMapRef?: React.MutableRefObject<FileMapType>
) {
  useEffect(() => {
    if (!selectedResourceRef?.current && !selectedPath) {
      setDiagnosticsOptions({
        validate: false,
      });
      return;
    }

    let resourceSchema;
    let validate = true;

    if (selectedResourceRef?.current) {
      resourceSchema = getResourceSchema(selectedResourceRef.current, k8sVersion, userDataDir);
      validate =
        resourceSchema &&
        !isKustomizationPatch(selectedResourceRef.current) &&
        isSupportedResource(selectedResourceRef.current);
    } else if (selectedPath && fileMapRef?.current) {
      resourceSchema = getSchemaForPath(selectedPath, fileMapRef.current);
      validate = resourceSchema !== undefined;
    }

    setDiagnosticsOptions({
      validate,
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      isKubernetes: Boolean(selectedResourceRef?.current),
      format: true,
      schemas: [
        {
          uri: 'http://monokle/k8s.json', // id of the first schema
          fileMatch: ['*'], // associate with our model
          schema: resourceSchema || {},
        },
      ],
    });
  }, [selectedResourceId, selectedPath, k8sVersion, userDataDir, fileMapRef, selectedResourceRef]);
}

export default useResourceYamlSchema;
