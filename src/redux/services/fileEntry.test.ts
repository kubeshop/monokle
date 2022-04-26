import {HELM_CHART_ENTRY_FILE, KUSTOMIZATION_KIND} from '@constants/constants';

import {AppConfig} from '@models/appconfig';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';

import initialState from '@redux/initialState';
import {createSafePath, getTestResourcePath} from '@redux/services/__test__/utils';
import {getK8sResources} from '@redux/services/resource';

import {createFileEntry, createRootFileEntry, getResourcesForPath, readFiles} from './fileEntry';

test('create-file-entry', () => {
  const fileMap: FileMapType = {};
  let r = createRootFileEntry('/root', fileMap);
  let e = createFileEntry({
    fileEntryPath: createSafePath('/a/very/long/path'),
    fileMap,
  });
  expect(e.isExcluded).toBeFalsy();
  expect(e.name).toBe('path');
  expect(e.filePath).toBe(createSafePath('/a/very/long/path'));
  expect(e.children).toBeUndefined();
});

export function readManifests(rootFolder: string) {
  const appConfig: AppConfig = initialState.config;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  const files = readFiles(rootFolder, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap);
  return {resourceMap, fileMap, files, helmChartMap, helmValuesMap};
}

test('read-files', () => {
  const {resourceMap, fileMap, files} = readManifests(getTestResourcePath('manifests/argo-rollouts'));

  expect(files.length).toBe(7);
  expect(Object.values(fileMap).length).toBe(27);
  expect(getK8sResources(resourceMap, KUSTOMIZATION_KIND).length).toBe(5);
  expect(getResourcesForPath(createSafePath('/base/argo-rollouts-aggregate-roles.yaml'), resourceMap).length).toBe(3);
});

test('read-folder-with-one-file', () => {
  const {resourceMap, fileMap, files, helmChartMap} = readManifests(getTestResourcePath('manifests/single'));

  expect(files.length).toBe(1);
  expect(Object.values(fileMap).length).toBe(2);
  expect(Object.values(resourceMap).length).toBe(1);
  expect(Object.values(helmChartMap).length).toBe(0);
});

test('read-folder-with-helm-chart', () => {
  const {resourceMap, fileMap, files, helmChartMap} = readManifests(
    createSafePath('src/redux/services/__test__/helm-charts/aks-helloworld')
  );

  expect(files.length).toBe(4);
  expect(Object.values(fileMap).length).toBe(6);
  expect(Object.values(resourceMap).length).toBe(0);

  let helmCharts = Object.values(helmChartMap);
  expect(helmCharts.length).toBe(1);
  expect(helmCharts[0].valueFileIds.length).toBe(1);
  expect(helmCharts[0].name).toBe('aks-helloworld');
  expect(fileMap[helmCharts[0].filePath].name).toBe(HELM_CHART_ENTRY_FILE);
});
