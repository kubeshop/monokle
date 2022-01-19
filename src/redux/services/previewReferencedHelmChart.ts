import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {v4 as uuidv4} from 'uuid';

import {AppDispatch} from '@redux/store';

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
    helmCommand: `helm install --kube-context ${kubeconfigContext} -f ${newTempValuesFilePath} --repo ${chartRepo} ${chartName} --version ${chartVersion} --generate-name --dry-run`,
    kubeconfig: kubeconfigPath,
  };

  const result = await runHelm(helmArgs);

  if (result.error) {
    throw new Error(result.error);
  }

  if (result.stdout) {
    const [yamlOutput, notes] = result.stdout.split('NOTES:');

    const objects = extractObjectsFromYaml(yamlOutput);

    objects.forEach(obj => {
      createUnsavedResource(
        {
          name: obj.metadata.name,
          kind: obj.kind,
          apiVersion: obj.apiVersion,
        },
        dispatch,
        obj
      );
    });

    return notes;
  }
};
