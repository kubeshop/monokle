import fs from 'fs';
import {AppConfig} from '@models/appconfig';
import initialState from '@redux/initialState';
import {HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileSystemEntryMap, RootEntry, isFileEntry, isFolderEntry} from '@models/filesystementry';
import {getK8sResources} from '@redux/services/resource';
import {createSafePath, getTestResourcePath} from '@redux/services/__test__/utils';
import {createFileSystemEntry, getResourcesForPath, readFilesFromFolder, getNameFromFilePath} from './fileSystemEntry';

test('create-file-entry', () => {
  const testRootEntry: RootEntry = {
    type: 'root',
    name: 'test',
    absPath: createSafePath('src/redux/services/__test__/manifests'),
    childrenEntryNames: [],
  };

  const expectedText = fs.readFileSync(
    createSafePath('src/redux/services/__test__/manifests/single/argo-rollouts-clusterrole.yaml'),
    'utf8'
  );

  let fsEntry = createFileSystemEntry(testRootEntry, createSafePath('/single/argo-rollouts-clusterrole.yaml'));
  expect(fsEntry.type).toBe('file');
  expect(fsEntry.name).toBe('argo-rollouts-clusterrole.yaml');
  expect(fsEntry.relPath).toBe(createSafePath('/single/argo-rollouts-clusterrole.yaml'));
  expect(fsEntry.isExcluded).toBeFalsy();
  expect(fsEntry).toHaveProperty('isDirty');
  expect(fsEntry).toHaveProperty('text');
  expect(isFileEntry(fsEntry)).toBeTruthy();
  if (isFileEntry(fsEntry)) {
    expect(fsEntry.text).toEqual(expectedText);
  }
});

test('create-folder-entry', () => {
  const testRootEntry: RootEntry = {
    type: 'root',
    name: 'test',
    absPath: createSafePath('src/redux/services/__test__/manifests'),
    childrenEntryNames: [],
  };

  let fsEntry = createFileSystemEntry(testRootEntry, createSafePath('/single'));
  expect(fsEntry.type).toBe('folder');
  expect(fsEntry.name).toBe('single');
  expect(fsEntry.relPath).toBe(createSafePath('/single'));
  expect(fsEntry.isExcluded).toBeFalsy();
  expect(fsEntry).toHaveProperty('childrenEntryNames');
  expect(isFolderEntry(fsEntry)).toBeTruthy();
});

function readManifests(rootFolderAbsPath: string) {
  const appConfig: AppConfig = initialState.config;
  const resourceMap: ResourceMapType = {};
  const fsEntryMap: FileSystemEntryMap = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  const rootEntry: RootEntry = {
    type: 'root',
    name: getNameFromFilePath(rootFolderAbsPath),
    absPath: rootFolderAbsPath,
    childrenEntryNames: [],
  };

  const files = readFilesFromFolder(
    rootFolderAbsPath,
    rootEntry,
    appConfig,
    resourceMap,
    fsEntryMap,
    helmChartMap,
    helmValuesMap
  );
  return {resourceMap, fsEntryMap, files, helmChartMap, helmValuesMap};
}

test('read-files', () => {
  const {resourceMap, fsEntryMap, files} = readManifests(getTestResourcePath('manifests/argo-rollouts'));

  expect(files.length).toBe(7);
  expect(Object.values(fsEntryMap).length).toBe(26);
  expect(getK8sResources(resourceMap, 'Kustomization').length).toBe(5);
  expect(getResourcesForPath(createSafePath('/base/argo-rollouts-aggregate-roles.yaml'), resourceMap).length).toBe(3);
});

test('read-folder-with-one-file', () => {
  const {resourceMap, fsEntryMap, files, helmChartMap, helmValuesMap} = readManifests(
    getTestResourcePath('manifests/single')
  );

  expect(files.length).toBe(1);
  expect(Object.values(fsEntryMap).length).toBe(1);
  expect(Object.values(resourceMap).length).toBe(1);
  expect(Object.values(helmChartMap).length).toBe(0);
});

test('read-folder-with-helm-chart', () => {
  const {resourceMap, fsEntryMap, files, helmChartMap, helmValuesMap} = readManifests(
    createSafePath('src/redux/services/__test__/helm-charts/aks-helloworld')
  );

  expect(files.length).toBe(4);
  expect(Object.values(fsEntryMap).length).toBe(5);
  expect(Object.values(resourceMap).length).toBe(2);

  let helmCharts = Object.values(helmChartMap);
  expect(helmCharts.length).toBe(1);
  expect(helmCharts[0].valueFileIds.length).toBe(1);
  expect(helmCharts[0].name).toBe('aks-helloworld');
  expect(fsEntryMap[helmCharts[0].filePath].name).toBe('Chart.yaml');
});
