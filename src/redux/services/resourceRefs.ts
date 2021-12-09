import {REF_PATH_SEPARATOR} from '@constants/constants';

import {ResourceMapType, ResourceRefsProcessingOptions} from '@models/appstate';
import {K8sResource, RefNode, RefPosition, ResourceRef, ResourceRefType} from '@models/k8sresource';
import {NamespaceRefTypeEnum, RefMapper} from '@models/resourcekindhandler';

import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {getIncomingRefMappers, getResourceKindHandler} from '@src/kindhandlers';

import {traverseDocument} from './manifest-utils';
import {NodeWrapper, createResourceRef, getParsedDoc, linkResources} from './resource';

export function isIncomingRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Incoming;
}

export function isOutgoingRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Outgoing;
}

export function isUnsatisfiedRef(refType: ResourceRefType) {
  return refType === ResourceRefType.Unsatisfied;
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isIncomingRef(e.type));
}

export function isFileRef(ref: ResourceRef) {
  return ref.target?.type === 'file';
}

export function isResourceRef(ref: ResourceRef) {
  return ref.target?.type === 'resource';
}

export function isResourceRefTo(ref: ResourceRef, resourceId: string) {
  return ref.target?.type === 'resource' && ref.target.resourceId === resourceId;
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.type));
}

export function hasRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.type));
}

export function hasUnsatisfiedRefs(resource: K8sResource) {
  return resource.refs?.some(e => isUnsatisfiedRef(e.type));
}

const joinPathParts = (pathParts: string[]) => {
  return pathParts.join(REF_PATH_SEPARATOR);
};

const addRefNodeAtPath = (refNode: RefNode, path: string, refNodesByPath: Record<string, RefNode[]>) => {
  if (refNodesByPath[path]) {
    refNodesByPath[path].push(refNode);
  } else {
    refNodesByPath[path] = [refNode];
  }
};

/**
 * Cache of refMappers for a specific resource kind
 */

const refMapperCache = new Map<string, RefMapper[]>();

const getRefMappers = (resource: K8sResource) => {
  if (!refMapperCache.has(resource.kind)) {
    const resourceKindHandler = getResourceKindHandler(resource.kind);
    if (!resourceKindHandler) {
      refMapperCache.set(resource.kind, []);
    } else {
      const outgoingRefMappers = resourceKindHandler?.outgoingRefMappers || [];
      const incomingRefMappers = getIncomingRefMappers(resource.kind);

      refMapperCache.set(resource.kind, [...incomingRefMappers, ...outgoingRefMappers]);
    }
  }

  return refMapperCache.get(resource.kind) || [];
};

/**
 * Checks if a node path ends with a refMapper path
 */

function pathEndsWithPath(pathParts: string[], endPathParts: string[]) {
  if (endPathParts.length > pathParts.length) {
    return false;
  }

  for (let c = 0; c < endPathParts.length; c += 1) {
    const pathIx = pathParts.length - 1 - c;
    const endPathIx = endPathParts.length - 1 - c;

    if (pathParts[pathIx] !== '*' && endPathParts[endPathIx] !== '*' && pathParts[pathIx] !== endPathParts[endPathIx]) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a node path equals a refMapper path
 */

function pathEqualsPath(pathParts: string[], path2Parts: string[]) {
  if (pathParts.length !== path2Parts.length) {
    return false;
  }

  for (let c = 0; c < pathParts.length; c += 1) {
    if (pathParts[c] !== '*' && path2Parts[c] !== '*' && pathParts[c] !== path2Parts[c]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates all refNodes for a resource for further processing
 */

export function processResourceRefNodes(resource: K8sResource) {
  const refMappers = getRefMappers(resource);
  if (refMappers.length === 0) {
    return;
  }

  const parsedDoc = getParsedDoc(resource);

  traverseDocument(parsedDoc, (parentKeyPathParts, keyPathParts, key, scalar) => {
    refMappers.forEach(refMapper => {
      if (!resource.refNodesByPath) {
        resource.refNodesByPath = {};
      }

      const refNode = {scalar, key, parentKeyPath: joinPathParts(parentKeyPathParts)};

      if (refMapper.matchPairs) {
        if (
          pathEqualsPath(refMapper.source.pathParts, parentKeyPathParts) ||
          pathEqualsPath(refMapper.target.pathParts, parentKeyPathParts)
        ) {
          addRefNodeAtPath(refNode, joinPathParts(keyPathParts), resource.refNodesByPath);
        }
      } else {
        if (pathEndsWithPath(keyPathParts, refMapper.source.pathParts)) {
          addRefNodeAtPath(refNode, joinPathParts(refMapper.source.pathParts), resource.refNodesByPath);
        }

        if (pathEndsWithPath(keyPathParts, refMapper.target.pathParts)) {
          addRefNodeAtPath(refNode, joinPathParts(refMapper.target.pathParts), resource.refNodesByPath);
        }
      }

      if (refMapper.source.hasOptionalSibling) {
        const optionalPathParts = [...refMapper.source.pathParts.slice(0, -1), 'optional'];
        if (pathEndsWithPath(keyPathParts, optionalPathParts)) {
          addRefNodeAtPath(refNode, joinPathParts(optionalPathParts), resource.refNodesByPath);
        }
      }

      if (refMapper.source.namespaceRef === NamespaceRefTypeEnum.Explicit) {
        const namespacePropertyName = refMapper.source.namespaceProperty || 'namespace';
        const namespacePathParts = [...refMapper.source.pathParts.slice(0, -1), namespacePropertyName];
        if (pathEndsWithPath(keyPathParts, namespacePathParts)) {
          addRefNodeAtPath(refNode, joinPathParts(namespacePathParts), resource.refNodesByPath);
        }
      }
    });
  });
}

/**
 * Clears invalid resourceRefs from a resource after processing
 */

function cleanResourceRefs(resources: K8sResource[]) {
  resources.forEach(resource => {
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

/**
 * Updates all refs to the specified deleted resource from other resources - outgoing links to the
 * deleted resource are either made unsatisifed or removed (if they were optional)
 */

export function updateReferringRefsOnDelete(resource: K8sResource, resourceMap: ResourceMapType) {
  if (!resource.refs) {
    return;
  }

  // get ids of all valid resources this resource refers to
  const ids: string[] = resource.refs
    .filter(ref => ref.target?.type === 'resource' && ref.target.resourceId && resourceMap[ref.target.resourceId])
    // @ts-ignore
    .map(ref => ref.target.resourceId);

  // make unique array to avoid processing the same resource twice
  [...new Set(ids)].forEach(id => {
    const res = resourceMap[id];
    if (res?.refs) {
      res.refs.forEach(ref => {
        // change outgoing refs to the deleted resource to unsatisfied
        if (
          isOutgoingRef(ref.type) &&
          ref.target &&
          ref.target.type === 'resource' &&
          ref.target.resourceId === resource.id &&
          !ref.target.isOptional
        ) {
          ref.type = ResourceRefType.Unsatisfied;
          ref.target.resourceId = undefined;
        }
      });

      // discard all resource refs still referring to the deleted resource
      res.refs = res.refs.filter(ref => ref.target?.type !== 'resource' || ref.target.resourceId !== resource.id);
    }
  });
}

/**
 * Creates resource refs from a specified resource to target resources using the specified refMapper
 */

function handleRefMappingByParentKey(
  sourceResource: K8sResource,
  targetResources: K8sResource[],
  outgoingRefMapper: RefMapper
) {
  const sourceRefNodes: RefNode[] = [];
  if (!sourceResource.refNodesByPath) {
    return;
  }

  Object.values(sourceResource.refNodesByPath)
    .flat()
    .forEach(({scalar, key, parentKeyPath}) => {
      const outgoingRefMapperSourcePath = joinPathParts(outgoingRefMapper.source.pathParts);
      if (outgoingRefMapperSourcePath === parentKeyPath) {
        sourceRefNodes.push({scalar, key, parentKeyPath});
      }
    });

  // if no target resources are found, then mark all source ref nodes as unsatisfied
  if (targetResources.length === 0) {
    sourceRefNodes.forEach(sourceRefNode => {
      createResourceRef(
        sourceResource,
        ResourceRefType.Unsatisfied,
        new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
        undefined,
        outgoingRefMapper.target.kind
      );
    });
  } else {
    sourceRefNodes.forEach(sourceRefNode => {
      const foundMatchByTargetResourceId: Record<string, boolean> = Object.fromEntries(
        targetResources.map(targetResource => [targetResource.id, false])
      );

      targetResources.forEach(targetResource => {
        const targetNodes: RefNode[] = [];
        if (!targetResource.refNodesByPath) {
          return;
        }
        Object.values(targetResource.refNodesByPath)
          .flat()
          .forEach(({scalar, key, parentKeyPath}) => {
            const outgoingRefMapperTargetPath = joinPathParts(outgoingRefMapper.target.pathParts);
            if (outgoingRefMapperTargetPath === parentKeyPath) {
              targetNodes.push({scalar, key, parentKeyPath});
            }
          });
        targetNodes.forEach(targetNode => {
          if (
            sourceRefNode.key === targetNode.key &&
            shouldCreateSatisifedRef(sourceRefNode, targetNode, sourceResource, targetResource, outgoingRefMapper)
          ) {
            foundMatchByTargetResourceId[targetResource.id] = true;
            linkResources(
              sourceResource,
              targetResource,
              new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
              new NodeWrapper(targetNode.scalar, targetResource.lineCounter),
              isOptional(sourceResource, sourceRefNode, outgoingRefMapper)
            );
          }
        });
      });

      // if this sourceRefNode did not link to any target resource, mark the node as unsatisfied
      if (Object.values(foundMatchByTargetResourceId).every(foundMatch => foundMatch === false)) {
        createResourceRef(
          sourceResource,
          ResourceRefType.Unsatisfied,
          new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
          undefined,
          outgoingRefMapper.target.kind
        );
      }
    });
  }
}

/**
 * Checks for an optional flag to determine if an unsatisfied resourceRef should be created or not
 */

function shouldCreateUnsatisfiedRef(
  outgoingRefMapper: RefMapper,
  processingOptions: ResourceRefsProcessingOptions,
  sourceResource: K8sResource,
  sourceRefNode: RefNode
) {
  if (outgoingRefMapper.source.hasOptionalSibling && processingOptions.shouldIgnoreOptionalUnsatisfiedRefs) {
    const optionalSiblingPath = joinPathParts([...outgoingRefMapper.source.pathParts.slice(0, -1), 'optional']);
    const optionalSiblingRefNode = sourceResource.refNodesByPath
      ? sourceResource.refNodesByPath[optionalSiblingPath]?.find(refNode =>
          refNode.parentKeyPath.startsWith(sourceRefNode.parentKeyPath)
        )
      : undefined;
    if (optionalSiblingRefNode && optionalSiblingRefNode.scalar.value === true) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if the nodes and eventual namespace descriminators match
 */

function shouldCreateSatisifedRef(
  sourceRefNode: RefNode,
  targetNode: RefNode,
  sourceResource: K8sResource,
  targetResource: K8sResource,
  outgoingRefMapper: RefMapper
) {
  if (sourceRefNode.scalar.value !== targetNode.scalar.value) {
    return false;
  }

  switch (outgoingRefMapper.source.namespaceRef) {
    case NamespaceRefTypeEnum.Implicit:
      return sourceResource.namespace === targetResource.namespace;
    case NamespaceRefTypeEnum.Explicit:
    case NamespaceRefTypeEnum.OptionalExplicit: {
      const namespacePropertyName = outgoingRefMapper.source.namespaceProperty || 'namespace';
      const namespaceSiblingPath = joinPathParts([
        ...outgoingRefMapper.source.pathParts.slice(0, -1),
        namespacePropertyName,
      ]);
      const namespaceSiblingRefNodes = sourceResource.refNodesByPath
        ? sourceResource.refNodesByPath[namespaceSiblingPath]
        : undefined;

      return namespaceSiblingRefNodes
        ? namespaceSiblingRefNodes.some(
            refNode =>
              refNode.parentKeyPath.startsWith(sourceRefNode.parentKeyPath) &&
              refNode.scalar.value === targetResource.namespace
          )
        : outgoingRefMapper.source.namespaceRef === NamespaceRefTypeEnum.OptionalExplicit &&
            sourceResource.namespace === targetResource.namespace;
    }

    default:
      return true;
  }
}

/**
 * Checks if the specified ref has an optional property set to true
 */

function isOptional(
  sourceResource: K8sResource,
  sourceRefNode: RefNode,
  outgoingRefMapper: RefMapper
): boolean | undefined {
  if (outgoingRefMapper.source.hasOptionalSibling) {
    const optionalSiblingPath = joinPathParts([...outgoingRefMapper.source.pathParts.slice(0, -1), 'optional']);
    const optionalSiblingRefNode = sourceResource.refNodesByPath
      ? sourceResource.refNodesByPath[optionalSiblingPath]?.find(refNode =>
          refNode.parentKeyPath.startsWith(sourceRefNode.parentKeyPath)
        )
      : undefined;

    return Boolean(optionalSiblingRefNode?.scalar.value);
  }

  return false;
}

/**
 * Creates resource refs from a specified resource to target resources using the specified refMapper
 */

function handleRefMappingByKey(
  sourceResource: K8sResource,
  targetResources: K8sResource[],
  outgoingRefMapper: RefMapper,
  processingOptions: ResourceRefsProcessingOptions
) {
  const outgoingRefMapperSourcePath = joinPathParts(outgoingRefMapper.source.pathParts);
  const sourceRefNodes = sourceResource.refNodesByPath
    ? sourceResource.refNodesByPath[outgoingRefMapperSourcePath]
    : undefined;

  if (!sourceRefNodes) {
    return;
  }

  sourceRefNodes.forEach(sourceRefNode => {
    // if no target resources are found, then mark the source ref as unsatisfied
    if (targetResources.length === 0) {
      if (shouldCreateUnsatisfiedRef(outgoingRefMapper, processingOptions, sourceResource, sourceRefNode)) {
        createResourceRef(
          sourceResource,
          ResourceRefType.Unsatisfied,
          new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
          undefined,
          outgoingRefMapper.target.kind,
          isOptional(sourceResource, sourceRefNode, outgoingRefMapper)
        );
      }
    } else {
      let hasSatisfiedRefs = false;

      targetResources.forEach(targetResource => {
        const outgoingRefMapperTargetPath = joinPathParts(outgoingRefMapper.target.pathParts);
        const targetNodes = targetResource.refNodesByPath
          ? targetResource.refNodesByPath[outgoingRefMapperTargetPath]
          : undefined;

        targetNodes?.forEach(targetNode => {
          if (shouldCreateSatisifedRef(sourceRefNode, targetNode, sourceResource, targetResource, outgoingRefMapper)) {
            hasSatisfiedRefs = true;
            linkResources(
              sourceResource,
              targetResource,
              new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
              new NodeWrapper(targetNode.scalar, targetResource.lineCounter),
              isOptional(sourceResource, sourceRefNode, outgoingRefMapper)
            );
          }
        });
      });

      if (
        !hasSatisfiedRefs &&
        shouldCreateUnsatisfiedRef(outgoingRefMapper, processingOptions, sourceResource, sourceRefNode)
      ) {
        createResourceRef(
          sourceResource,
          ResourceRefType.Unsatisfied,
          new NodeWrapper(sourceRefNode.scalar, sourceResource.lineCounter),
          undefined,
          outgoingRefMapper.target.kind,
          isOptional(sourceResource, sourceRefNode, outgoingRefMapper)
        );
      }
    }
  });
}

/*
  removes all outgoing refs on the specified resource and
  removes all incoming refs from the specified resource on all the other resources
*/
function clearResourceRefs(resource: K8sResource, resourceMap: ResourceMapType) {
  resource.refs = resource.refs?.filter(ref => ref.type === 'incoming');
  Object.values(resourceMap).forEach(currentResource => {
    currentResource.refs = currentResource.refs?.filter(
      ref => ref.type !== 'incoming' || !isResourceRefTo(ref, resource.id)
    );
  });
}

/**
 * Checks if the specified targetResource matches the refMapper
 */

function resourceMatchesRefMapper(targetResource: K8sResource, outgoingRefMapper: RefMapper) {
  return targetResource.kind === outgoingRefMapper.target.kind && !isKustomizationPatch(targetResource);
}

/**
 * Updates all refs for the specified resources
 */

export function processRefs(
  resourceMap: ResourceMapType,
  processingOptions: ResourceRefsProcessingOptions,
  filter?: {resourceIds?: string[]; resourceKinds?: string[]}
) {
  // select which resources to process based on optional filter
  const resources: K8sResource[] = [];

  if (filter && filter.resourceIds) {
    resources.push(...filter.resourceIds.map(id => resourceMap[id]));
  }

  if (filter && filter.resourceKinds) {
    resources.push(...Object.values(resourceMap).filter(resource => filter?.resourceKinds?.includes(resource.kind)));
  }

  if (!filter?.resourceIds && !filter?.resourceKinds) {
    resources.push(
      ...Object.values(resourceMap).filter(
        resource => !isKustomizationResource(resource) && !isKustomizationPatch(resource)
      )
    );
  }

  // prep for processing
  let processedResourceIds = new Set<string>();
  const k8sResources = Object.values(resourceMap);

  resources.forEach(sourceResource => {
    clearResourceRefs(sourceResource, resourceMap);
    processResourceRefNodes(sourceResource);
    if (sourceResource.refNodesByPath && Object.values(sourceResource.refNodesByPath).length > 0) {
      const resourceKindHandler = getResourceKindHandler(sourceResource.kind);
      if (resourceKindHandler?.outgoingRefMappers && resourceKindHandler.outgoingRefMappers.length > 0) {
        resourceKindHandler.outgoingRefMappers.forEach(outgoingRefMapper => {
          const targetResources = k8sResources.filter(targetResource =>
            resourceMatchesRefMapper(targetResource, outgoingRefMapper)
          );

          targetResources
            // make sure we don't process the same resource twice
            .filter(resource => !processedResourceIds.has(resource.id))
            .forEach(resource => {
              processResourceRefNodes(resource);
              processedResourceIds.add(resource.id);
            });

          if (outgoingRefMapper.matchPairs) {
            handleRefMappingByParentKey(sourceResource, targetResources, outgoingRefMapper);
          } else {
            handleRefMappingByKey(sourceResource, targetResources, outgoingRefMapper, processingOptions);
          }
        });
      }
    }
  });

  cleanResourceRefs(resources);
}

/**
 * Return a list of resource ids to reprocess when the specified resource has been updated
 */

export function findResourcesToReprocess(resource: K8sResource, resourceMap: ResourceMapType) {
  // the resource itself
  let resources = [resource.id];

  // all existing resources with incoming refs to the resource (since they might have broken)
  resource.refs
    ?.filter(ref => isIncomingRef(ref.type))
    .forEach(ref => {
      if (ref.target?.type === 'resource' && ref.target.resourceId) {
        resources.push(ref.target.resourceId);
      }
    });

  // all existing resources with broken refs (since they might now work) -> this should be improved to
  // only return resources that could actually refer to the updated resource.
  Object.values(resourceMap)
    .filter(r => resources.indexOf(r.id) === -1)
    .filter(r => r.refs?.some(ref => isUnsatisfiedRef(ref.type)))
    .forEach(r => resources.push(r.id));

  return resources;
}
