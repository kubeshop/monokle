import {AppConfig} from '@models/appconfig';
import {initialState} from '@redux/initialState';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {getK8sResources} from '@redux/utils/resource';
import {createFileEntry, getResourcesForPath, readFiles} from './fileEntry';

test('create-file-entry', () => {
  let e = createFileEntry('/a/very/long/path');
  expect(e.highlight).toBeFalsy();
  expect(e.selected).toBeFalsy();
  expect(e.expanded).toBeFalsy();
  expect(e.excluded).toBeFalsy();
  expect(e.name).toBe('path');
  expect(e.filePath).toBe('/a/very/long/path');
  expect(e.children).toBeUndefined();
});

function readManifests(rootFolder: string) {
  const appConfig: AppConfig = initialState.appConfig;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};

  const files = readFiles(rootFolder, appConfig, resourceMap, fileMap);
  return {resourceMap, fileMap, files};
}

test('read-files', () => {
  const {resourceMap, fileMap, files} = readManifests('src/redux/utils/__test__/manifests/argo-rollouts');

  expect(files.length).toBe(7);
  expect(Object.values(fileMap).length).toBe(27);
  expect(getK8sResources(resourceMap, 'Kustomization').length).toBe(5);
  expect(getResourcesForPath('/base/argo-rollouts-aggregate-roles.yaml', resourceMap).length).toBe(3);
});

test('read-folder-with-one-file', () => {
  const {resourceMap, fileMap, files} = readManifests('src/redux/utils/__test__/manifests/single');

  expect(files.length).toBe(1);
  expect(Object.values(fileMap).length).toBe(2);
  expect(Object.values(resourceMap).length).toBe(1);
});
