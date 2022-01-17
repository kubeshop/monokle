import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {promisify} from 'util';
import {v4 as uuidv4} from 'uuid';
import {LineCounter, parseAllDocuments} from 'yaml';

import {AppDispatch} from '@redux/store';

import {runHelm} from '@utils/helm';

import {interpolateTemplate} from './templates';
import {createUnsavedResource} from './unsavedResource';

const fsWriteFilePromise = promisify(fs.writeFile);
const fsReadFilePromise = promisify(fs.readFile);

interface PossibleResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    [x: string]: any;
  };
  [x: string]: any;
}

function extractObjectsFromYaml(yamlText: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllDocuments(yamlText, {lineCounter});
  const result: PossibleResource[] = [];
  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        log.warn(`Ignoring document ${docIndex} in due to ${doc.errors.length} error(s)`);
      } else {
        const content = doc.toJS();
        if (content && content.apiVersion && content.kind && content.metadata?.name) {
          result.push(content);
        }
      }
      docIndex += 1;
    });
  }
  return result;
}

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
