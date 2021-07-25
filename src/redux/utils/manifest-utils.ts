import {Document, isMap, isPair, isSeq, ParsedNode, parseDocument, visit} from 'yaml';

function copyValueIfMissing(templateDoc: Document.Parsed<ParsedNode>, path: readonly (any)[]) {
  const templateNode = findValueNode(templateDoc, path);
  if (!templateNode) {
    const nodePath = createNodePath(path);
    templateDoc.addIn(nodePath.slice(0, nodePath.length - 1), path[path.length - 1]);
  }
}

/**
 * Function to merge the values of one yaml file into an existing one - maintaining
 * node order as much as possible
 */

export function mergeManifests(template: string, values: string) {
  const templateDoc = parseDocument(template);
  const valuesDoc = parseDocument(values);

  const pathsToRemove: any[] = [];

  // start by updating and removing values in template doc
  visit(templateDoc, {
    // scalar values
    Scalar(key, node, path) {
      if (key === 'value') {
        const valueNode = findValueNode(valuesDoc, path);
        if (valueNode && 'value' in valueNode) {
          node.value = valueNode.value;
        } else {
          pathsToRemove.push(createNodePath(path));
        }
      }
    },
    // sequences
    Seq(key, node, path) {
      const valueNode = findValueNode(valuesDoc, path);
      if (isSeq(valueNode)) {
        // brute-force replace sequences for now - need to revisit...
        node.items = valueNode.items;
        return visit.SKIP;
      }
    },
  });

  pathsToRemove.forEach(path => {
    templateDoc.deleteIn(path);

    // delete any empty maps left by the deleted node
    while (path.length > 0) {
      path = path.slice(0, path.length - 1);
      let node = templateDoc.getIn(path);
      if (isMap(node) && node.items.length === 0) {
        templateDoc.deleteIn(path);
      } else {
        break;
      }
    }
  });

  // now add missing values to template doc
  visit(valuesDoc, {
    Scalar(key, node, path) {
      if (key === 'value') {
        copyValueIfMissing(templateDoc, path);
      }
    },
    // sequences
    Seq(key, node, path) {
      copyValueIfMissing(templateDoc, path);
    },
  });

  return templateDoc.toString().trim();
}

function findValueNode(valuesDoc: Document.Parsed<ParsedNode>, path: readonly any[]) {
  // start at third path since root is Document and first is always a map
  let valueNode = valuesDoc.contents;

  for (let c = 2; valueNode && c < path.length; c += 1) {
    let node = path[c];
    if (isPair(node)) {
      // @ts-ignore
      valueNode = valueNode.get(node.key, true);
    }
  }

  return valueNode;
}

function createNodePath(path: readonly any[]) {
  let result: string[] = [];

  for (let c = 2; c < path.length; c += 1) {
    let node = path[c];
    if (node && 'key' in node) {
      // @ts-ignore
      result.push(node.key.value);
    }
  }

  return result;
}
