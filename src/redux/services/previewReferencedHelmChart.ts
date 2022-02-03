import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {v4 as uuidv4} from 'uuid';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {runHelm} from '@utils/helm';

import {extractObjectsFromYaml} from './manifest-utils';
import {interpolateTemplate} from './templates';
import {createUnsavedResource} from './unsavedResource';

const fsWriteFilePromise = promisify(fs.writeFile);
const fsReadFilePromise = promisify(fs.readFile);

/**
 * Thunk to preview a Helm Chart
 */
export const previewReferencedHelmChart = async (
  chartName: string,
  chartVersion: string,
  chartRepo: string,
  valuesFilePath: string,
  formsData: any[],
  kubeconfigPath: string,
  kubeconfigContext: string,
  userTempDir: string,
  dispatch: AppDispatch
) => {
  const valuesFileContent = await fsReadFilePromise(valuesFilePath, 'utf8');
  const newTempValuesFilePath = path.join(userTempDir, uuidv4());

  const parsedValuesFileContent: string = interpolateTemplate(valuesFileContent, formsData);

  await fsWriteFilePromise(newTempValuesFilePath, parsedValuesFileContent);

  const helmArgs = {
    helmCommand: `helm install --kube-context ${kubeconfigContext} -f "${newTempValuesFilePath}" --repo ${chartRepo} ${chartName} --version ${chartVersion} --generate-name --dry-run`,
    kubeconfig: kubeconfigPath,
  };

  const result = await runHelm(helmArgs);

  if (result.error) {
    throw new Error(result.error);
  }

  const createdResources: K8sResource[] = [];
  const {stdout} = result;
  if (typeof stdout === 'string') {
    const [yamlOutput, notes] = stdout.split('NOTES:');
    const objects = extractObjectsFromYaml(yamlOutput);
    objects.forEach(obj => {
      const resource = createUnsavedResource(
        {
          name: obj.metadata.name,
          kind: obj.kind,
          apiVersion: obj.apiVersion,
        },
        dispatch,
        obj
      );
      createdResources.push(resource);
    });

    return {message: notes.length > 0 ? notes : 'Done.', resources: createdResources};
  }

  return {message: 'Done.', resources: createdResources};
};
