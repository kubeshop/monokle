import path from 'path';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRefType, RefNode, ResourceRef} from '@models/k8sresource';
import fs from 'fs';
import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER, REF_PATH_SEPARATOR} from '@constants/constants';
import {isKustomizationResource, processKustomizations} from '@redux/services/kustomize';
import {getAbsoluteResourcePath, getResourcesForPath} from '@redux/services/fileEntry';
import {LineCounter, parseAllDocuments, parseDocument, Scalar, YAMLSeq} from 'yaml';
import log from 'loglevel';
import {isUnsatisfiedRef} from '@redux/services/resourceRefs';
import {v4 as uuidv4} from 'uuid';
import {getResourceKindHandler, getIncomingRefMappers} from '@src/kindhandlers';
import {traverseDocument} from './manifest-utils';

/**
 * Parse documents lazily...
 */

function getParsedDoc(resource: K8sResource) {
  if (!resource.parsedDoc) {
    const lineCounter = new LineCounter();
    resource.parsedDoc = parseDocument(resource.text, {lineCounter});
    resource.lineCounter = lineCounter;
  }

  return resource.parsedDoc;
}

/**
 * Returns the Scalar at the specified path
 */

export function getScalarNode(resource: K8sResource, nodePath: string) {
  let parent: any = getParsedDoc(resource);

  const names = parseNodePath(nodePath);
  for (let ix = 0; ix < names.length; ix += 1) {
    const child = parent.get(names[ix], true);
    if (child) {
      // @ts-ignore
      parent = child;
    } else {
      log.warn(`${nodePath} not found in resource`);
      return undefined;
    }
  }

  if (parent instanceof Scalar) {
    return new NodeWrapper(parent, resource.lineCounter);
  }

  log.warn(`node at ${nodePath} is not a Scalar`);
}

/**
 * Parses a nodePath into segments - simple split for now
 */

export function parseNodePath(nodePath: string) {
  return nodePath.split(':');
}

/**
 * Returns the Scalar at the specified path
 */

export function getScalarNodes(resource: K8sResource, nodePath: string) {
  let parent: any = getParsedDoc(resource);

  const names = parseNodePath(nodePath);
  for (let ix = 0; ix < names.length; ix += 1) {
    const child = parent.get(names[ix], true);
    if (child) {
      // @ts-ignore
      parent = child;
    } else {
      log.warn(`${nodePath} not found in resource`);
      return [];
    }
  }

  if (parent instanceof YAMLSeq) {
    return parent.items.map(node => new NodeWrapper(node, resource.lineCounter));
  }

  log.warn(`node at ${nodePath} is not a YAMLSeq`);
  return [];
}

/**
 * Utility class used when parsing and creating refs
 */

export class NodeWrapper {
  node: Scalar;
  lineCounter?: LineCounter;

  constructor(node: Scalar, lineCounter?: LineCounter) {
    this.node = node;
    this.lineCounter = lineCounter;
  }

  nodeValue(): string {
    return this.node.value as string;
  }

  getNodePosition(): RefPosition {
    if (this.lineCounter && this.node.range) {
      const linePos = this.lineCounter.linePos(this.node.range[0]);
      return {
        line: linePos.line,
        column: linePos.col,
        length: this.node.range[1] - this.node.range[0],
      };
    }

    return {line: 0, column: 0, length: 0};
  }
}

/**
 * Utility function to get all resources of a specific kind
 */

export function getK8sResources(resourceMap: ResourceMapType, type: string) {
  return Object.values(resourceMap).filter(item => item.kind === type);
}

/**
 * Adds a resource ref with the specified type/target to the specified resource
 */

function createResourceRef(
  resource: K8sResource,
  refType: ResourceRefType,
  refNode?: NodeWrapper,
  targetResource?: string
) {
  if (refNode || targetResource) {
    resource.refs = resource.refs || [];
    const refName = (refNode ? refNode.nodeValue() : targetResource) || '<missing>';

    // make sure we don't duplicate
    if (
      !resource.refs.some(
        ref => ref.type === refType && ref.name === refName && ref.targetResourceId === targetResource
      )
    ) {
      resource.refs.push({
        type: refType,
        name: refName,
        position: refNode?.getNodePosition(),
        targetResourceId: targetResource,
      });
    }
  } else {
    log.warn(`missing both refNode and targetResource for refType ${refType} on resource ${resource.fileRelativePath}`);
  }
}

/**
 * Creates bidirectional resourcerefs between two resources
 */

export function linkResources(
  source: K8sResource,
  target: K8sResource,
  sourceRef: NodeWrapper,
  targetRef?: NodeWrapper
) {
  createResourceRef(source, ResourceRefType.Outgoing, sourceRef, target.id);
  createResourceRef(target, ResourceRefType.Incoming, targetRef, source.id);
}

/**
 * Extracts all unique namespaces from resources in specified resourceMap
 */

export function getNamespaces(resourceMap: ResourceMapType) {
  const namespaces: string[] = [];
  Object.values(resourceMap).forEach(e => {
    if (e.namespace && !namespaces.includes(e.namespace)) {
      namespaces.push(e.namespace);
    }
  });
  return namespaces;
}

/**
 * Creates a UI friendly resource name
 */

export function createResourceName(filePath: string, content: any) {
  // for Kustomizations we return the name of the containing folder ('base', 'staging', etc)
  if (content.kind === 'Kustomization') {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      return filePath.substr(1, ix - 1);
    }
    return filePath;
  }

  // use metadata name if available
  if (content.metadata?.name) {
    // name could be an object if it's a helm template value...
    if (typeof content.metadata.name !== 'string') {
      return JSON.stringify(content.metadata.name).trim();
    }

    return content.metadata.name;
  }

  // use filename as last resort
  const ix = filePath.lastIndexOf(path.sep);
  if (ix > 0) {
    return filePath.substr(ix + 1);
  }

  return filePath;
}

/**
 * Checks if this specified resource is from a file (and not a virtual one)
 */

export function isFileResource(resource: K8sResource) {
  return !resource.fileRelativePath.startsWith(PREVIEW_PREFIX);
}

/**
 * Saves the specified value to the file of the specified resource - handles both
 * single and multi-resource files
 */

export function saveResourceFile(resource: K8sResource, fileMap: FileMapType) {
  let newFileContent = `${resource.text.trim()}\n`;

  if (isFileResource(resource)) {
    const fileEntry = fileMap[resource.fileRelativePath];

    let absoluteResourcePath = getAbsoluteResourcePath(resource, fileMap);
    if (resource.range) {
      const content = fs.readFileSync(absoluteResourcePath, 'utf8');

      // need to make sure that document delimiter is still there if this resource was not first in the file
      if (resource.range.start > 0 && !newFileContent.startsWith(YAML_DOCUMENT_DELIMITER)) {
        newFileContent = `${YAML_DOCUMENT_DELIMITER}${newFileContent}`;
      }

      fs.writeFileSync(
        absoluteResourcePath,
        content.substr(0, resource.range.start) +
          newFileContent +
          content.substr(resource.range.start + resource.range.length)
      );
    } else {
      // only document => just write to file
      fs.writeFileSync(absoluteResourcePath, resource.text);
    }

    fileEntry.timestamp = fs.statSync(absoluteResourcePath).mtime.getTime();
  }

  return newFileContent;
}

/**
 * This needs to be called to remove temporary objects used during processing which are not serializable
 */

export function clearParsedDocs(resourceMap: ResourceMapType) {
  Object.values(resourceMap).forEach(r => {
    r.parsedDoc = undefined;
    r.lineCounter = undefined;
    r.refNodeByPath = undefined;
  });

  return resourceMap;
}

/**
 * Reprocesses the specified resourceIds in regard to refs/etc (called after updating...)
 *
 * This could be more intelligent - it updates everything brute force for now...
 */

export function reprocessResources(resourceIds: string[], resourceMap: ResourceMapType, fileMap: FileMapType) {
  resourceIds.forEach(id => {
    const resource = resourceMap[id];
    if (resource) {
      resource.name = createResourceName(resource.fileRelativePath, resource.content);
      resource.kind = resource.content.kind;
      resource.version = resource.content.apiVersion;
      resource.namespace = resource.content.metadata?.namespace;
    }
  });

  let hasKustomizations = false;
  Object.values(resourceMap).forEach(resource => {
    resource.refs = undefined;
    if (isKustomizationResource(resource)) {
      hasKustomizations = true;
    }
  });

  if (hasKustomizations) {
    processKustomizations(resourceMap, fileMap);
  }

  processParsedResources(resourceMap);
  clearParsedDocs(resourceMap);
}

/**
 * Establishes refs for all resources in specified resourceMap
 */

export function processParsedResources(resourceMap: ResourceMapType) {
  processRefs(resourceMap);
}

/**
 * udpates resource ranges for all resources in the same file as the specified
 * resource
 */

export function recalculateResourceRanges(resource: K8sResource, state: AppState) {
  // if length of value has changed we need to recalculate document ranges for
  // subsequent resource so future saves will be at correct place in document
  if (resource.range && resource.range.length !== resource.text.length) {
    const fileEntry = state.fileMap[resource.fileRelativePath];
    if (fileEntry) {
      // get list of resourceIds in file sorted by startPosition
      const resourceIds = getResourcesForPath(resource.fileRelativePath, state.resourceMap)
        .sort((a, b) => {
          return a.range && b.range ? a.range.start - b.range.start : 0;
        })
        .map(r => r.id);

      let resourceIndex = resourceIds.indexOf(resource.id);
      if (resourceIndex !== -1) {
        const diff = resource.text.length - resource.range.length;
        resource.range.length = resource.text.length;

        while (resourceIndex < resourceIds.length - 1) {
          resourceIndex += 1;
          let rid = resourceIds[resourceIndex];
          const r = state.resourceMap[rid];
          if (r && r.range) {
            r.range.start += diff;
          } else {
            throw new Error(`Failed to find resource ${rid} in fileEntry resourceIds for ${fileEntry.name}`);
          }
        }
      } else {
        throw new Error(`Failed to find resource in list of ids of fileEntry for ${fileEntry.name}`);
      }
    } else {
      throw new Error(`Failed to find fileEntry for resource with path ${resource.fileRelativePath}`);
    }
  }
}

/**
 * Extracts all resources from the specified text content (must be yaml)
 */

export function extractK8sResources(fileText: string, fileRelativePath: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllDocuments(fileText, {lineCounter});
  const result: K8sResource[] = [];

  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        log.warn(
          `Ignoring document ${docIndex} in ${path.parse(fileRelativePath).name} due to ${doc.errors.length} error(s)`
        );
      } else {
        const content = doc.toJS();
        if (content && content.apiVersion && content.kind) {
          const text = fileText.slice(doc.range[0], doc.range[1]);

          let resource: K8sResource = {
            name: createResourceName(fileRelativePath, content),
            fileRelativePath,
            id: uuidv4(),
            isHighlighted: false,
            isSelected: false,
            kind: content.kind,
            version: content.apiVersion,
            content,
            text,
            isDirty: false,
          };

          // if this is a single-resource file we can save the parsedDoc and lineCounter
          if (documents.length === 1) {
            resource.parsedDoc = doc;
            resource.lineCounter = lineCounter;
          } else {
            // for multi-resource files we just save the range - the parsedDoc and lineCounter will
            // be created on demand (since they are incorrect in this context)
            resource.range = {start: doc.range[0], length: doc.range[1] - doc.range[0]};
          }

          // set the namespace if available
          if (content.metadata?.namespace) {
            resource.namespace = content.metadata.namespace;
          }

          result.push(resource);
        }
      }
      docIndex += 1;
    });
  }
  return result;
}

/**
 * Gets all resources linked to the specified resource
 */

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = [];
  resource.refs
    ?.filter(ref => !isUnsatisfiedRef(ref.type))
    .forEach(ref => {
      if (ref.targetResourceId) {
        linkedResourceIds.push(ref.targetResourceId);
      }
    });

  return linkedResourceIds;
}

const joinPathParts = (pathParts: string[]) => {
  return pathParts.join(REF_PATH_SEPARATOR);
};

export function processResourceRefNodes(resource: K8sResource) {
  const parsedDoc = getParsedDoc(resource);

  const resourceKindHandler = getResourceKindHandler(resource.kind);
  if (!resourceKindHandler) {
    return;
  }
  const outgoingRefMappers = resourceKindHandler?.outgoingRefMappers || [];
  const incomingRefMappers = getIncomingRefMappers(resource.kind);

  const refMappers = [...incomingRefMappers, ...outgoingRefMappers];

  if (!refMappers || refMappers.length === 0) {
    return;
  }

  traverseDocument(parsedDoc, (parentKeyPathParts, keyPathParts, key, scalar) => {
    refMappers.forEach(refMapper => {
      if (!resource.refNodeByPath) {
        resource.refNodeByPath = {};
      }

      const keyPath = joinPathParts(keyPathParts);
      const parentKeyPath = joinPathParts(parentKeyPathParts);

      if (refMapper.matchPairs) {
        if (
          joinPathParts(refMapper.source.pathParts) === parentKeyPath ||
          joinPathParts(refMapper.target.pathParts) === parentKeyPath
        ) {
          resource.refNodeByPath[keyPath] = {scalar, key, parentKeyPath};
        }
      } else {
        if (keyPath.endsWith(joinPathParts(refMapper.source.pathParts))) {
          resource.refNodeByPath[joinPathParts(refMapper.source.pathParts)] = {scalar, key, parentKeyPath};
        }

        if (keyPath.endsWith(joinPathParts(refMapper.target.pathParts))) {
          resource.refNodeByPath[joinPathParts(refMapper.target.pathParts)] = {scalar, key, parentKeyPath};
        }
      }
    });
  });
}

function processRefs(resourceMap: ResourceMapType) {
  Object.values(resourceMap).forEach(resource => processResourceRefNodes(resource));

  Object.values(resourceMap).forEach(resource => {
    const resourceKindHandler = getResourceKindHandler(resource.kind);
    if (
      !resourceKindHandler ||
      !resourceKindHandler.outgoingRefMappers ||
      resourceKindHandler.outgoingRefMappers.length === 0
    ) {
      return;
    }
    resourceKindHandler.outgoingRefMappers.forEach(outgoingRefMapper => {
      if (!resource.refNodeByPath) {
        return;
      }

      const targetResources = Object.values(resourceMap).filter(
        targetResource => targetResource.kind === outgoingRefMapper.target.kind
      );

      if (outgoingRefMapper.matchPairs) {
        const refNodes: RefNode[] = [];
        Object.values(resource.refNodeByPath).forEach(({scalar, key, parentKeyPath}) => {
          if (joinPathParts(outgoingRefMapper.source.pathParts) === parentKeyPath) {
            refNodes.push({scalar, key, parentKeyPath});
          }
        });

        targetResources.forEach(targetResource => {
          const targetNodes: RefNode[] = [];
          if (!targetResource.refNodeByPath) {
            return;
          }
          Object.values(targetResource.refNodeByPath).forEach(({scalar, key, parentKeyPath}) => {
            if (joinPathParts(outgoingRefMapper.target.pathParts) === parentKeyPath) {
              targetNodes.push({scalar, key, parentKeyPath});
            }
          });
          const foundMatchByTargetNodeKey: Record<string, boolean> = Object.fromEntries(
            targetNodes.map(targetNode => [targetNode.key, false])
          );
          refNodes.forEach(refNode => {
            targetNodes.forEach(targetNode => {
              if (refNode.key === targetNode.key && refNode.scalar.value === targetNode.scalar.value) {
                foundMatchByTargetNodeKey[refNode.key] = true;
                linkResources(
                  targetResource,
                  resource,
                  new NodeWrapper(targetNode.scalar, targetResource.lineCounter),
                  new NodeWrapper(refNode.scalar, resource.lineCounter)
                );
              }
            });
          });

          Object.entries(foundMatchByTargetNodeKey).forEach(([refNodeKey, foundMatch]) => {
            if (!foundMatch) {
              const targetNode = targetNodes.find(r => r.key === refNodeKey);
              if (!targetNode) {
                return;
              }

              createResourceRef(
                targetResource,
                ResourceRefType.Unsatisfied,
                new NodeWrapper(targetNode.scalar, targetResource.lineCounter)
              );
            }
          });
        });
      } else {
        const refNode = resource.refNodeByPath
          ? resource.refNodeByPath[joinPathParts(outgoingRefMapper.source.pathParts)]
          : undefined;

        targetResources.forEach(targetResource => {
          const targetNode = targetResource.refNodeByPath
            ? targetResource.refNodeByPath[joinPathParts(outgoingRefMapper.target.pathParts)]
            : undefined;

          if (refNode) {
            if (targetNode && refNode.scalar.value === targetNode.scalar.value) {
              linkResources(
                targetResource,
                resource,
                new NodeWrapper(targetNode.scalar, targetResource.lineCounter),
                new NodeWrapper(refNode.scalar, resource.lineCounter)
              );
            } else {
              createResourceRef(
                resource,
                ResourceRefType.Unsatisfied,
                new NodeWrapper(refNode.scalar, resource.lineCounter)
              );
            }
          }
        });
      }
    });
  });

  // clean up the refs
  Object.values(resourceMap).forEach(resource => {
    const cleanRefs: ResourceRef[] = [];

    const findSatisfiedRefOnPosition = (refPos: RefPosition) => {
      return resource.refs?.find(
        ref =>
          !isUnsatisfiedRef(ref.type) && ref.position?.column === refPos.column && ref.position.line === refPos.line
      );
    };

    resource.refs?.forEach(ref => {
      let shouldPush = true;

      if (isUnsatisfiedRef(ref.type)) {
        if (ref.position) {
          const foundSatisfiedRefOnSamePosition = findSatisfiedRefOnPosition(ref.position);
          if (foundSatisfiedRefOnSamePosition) {
            shouldPush = false;
          }
        }
      }

      if (shouldPush) {
        cleanRefs.push(ref);
      }
    });

    resource.refs = cleanRefs.length > 0 ? cleanRefs : undefined;
  });
}
