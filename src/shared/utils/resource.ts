import 'electron';

import {existsSync, readFileSync} from 'fs';
import path from 'path';

import {
  ResourceIdentifier,
  ResourceMeta,
  ResourceMetaMap,
  ResourceMetaStorage,
  ResourceStorageKey,
} from '@shared/models/k8sResource';

import {getMainProcessEnv} from './env';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */
export function getStaticResourcePath(resourcePath: string) {
  const mainProcessEnv = getMainProcessEnv();

  if (mainProcessEnv?.NODE_ENV === 'test') {
    return path.join('resources', resourcePath);
  }

  return mainProcessEnv?.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, 'resources', resourcePath)
    : path.join('resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */
export function loadResource(resourcePath: string) {
  const staticResourcePath = getStaticResourcePath(resourcePath);
  return existsSync(staticResourcePath) ? readFileSync(staticResourcePath, 'utf8') : undefined;
}

export function loadBinaryResource(resourcePath: string): ArrayBuffer | undefined {
  const staticResourcePath = getStaticResourcePath(resourcePath);
  return existsSync(staticResourcePath) ? readFileSync(staticResourcePath) : undefined;
}

export function findResourceMetaInStorage(
  resourceIdentifier: ResourceIdentifier | {id: string; storage: ResourceStorageKey},
  storage: ResourceMetaStorage
) {
  const storageKey = 'storage' in resourceIdentifier ? resourceIdentifier.storage : resourceIdentifier.origin.storage;
  const resourceMetaMap: ResourceMetaMap = storage[storageKey];
  return resourceMetaMap[resourceIdentifier.id] as ResourceMeta | undefined;
}
