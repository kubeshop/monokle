import {AppConfig} from '@models/appconfig';
import {initialState} from '@redux/initialState';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {getK8sResources} from '@redux/utils/resource';
import {createSafePath, getTestResourcePath} from '@redux/utils/__test__/utils';
import {createFileEntry, getResourcesForPath, readFiles} from './fileEntry';

test('create-file-entry', () => {
  let e = createFileEntry(createSafePath('/a/very/long/path'));
  expect(e.highlight).toBeFalsy();
  expect(e.selected).toBeFalsy();
  expect(e.expanded).toBeFalsy();
  expect(e.excluded).toBeFalsy();
  expect(e.name).toBe('path');
  expect(e.filePath).toBe(createSafePath('/a/very/long/path'));
  expect(e.children).toBeUndefined();
});

function readManifests(rootFolder: string) {
  const appConfig: AppConfig = initialState.appConfig;
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
  expect(getK8sResources(resourceMap, 'Kustomization').length).toBe(5);
  expect(getResourcesForPath(createSafePath('/base/argo-rollouts-aggregate-roles.yaml'), resourceMap).length).toBe(3);
});

test('read-folder-with-one-file', () => {
  const {resourceMap, fileMap, files, helmChartMap, helmValuesMap} = readManifests(
    getTestResourcePath('manifests/single')
  );

  expect(files.length).toBe(1);
  expect(Object.values(fileMap).length).toBe(2);
  expect(Object.values(resourceMap).length).toBe(1);
  expect(Object.values(helmChartMap).length).toBe(0);
});

test('read-folder-with-helm-chart', () => {
  const {resourceMap, fileMap, files, helmChartMap, helmValuesMap} = readManifests(
    createSafePath('src/redux/utils/__test__/helm-charts/aks-helloworld')
  );

  expect(files.length).toBe(4);
  expect(Object.values(fileMap).length).toBe(6);
  expect(Object.values(resourceMap).length).toBe(2);

  let helmCharts = Object.values(helmChartMap);
  expect(helmCharts.length).toBe(1);
  expect(helmCharts[0].valueFiles.length).toBe(1);
  expect(helmCharts[0].name).toBe('aks-helloworld');
  expect(fileMap[helmCharts[0].filePath].name).toBe('Chart.yaml');
});
