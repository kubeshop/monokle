import {Document, LineCounter, parseAllDocuments, parseDocument, stringify} from 'yaml';
import {CreateNodeOptions, DocumentOptions, ParseOptions, SchemaOptions, ToStringOptions} from 'yaml/dist/options';

/**
 * Wrapper that ensures consistent options
 */

export function parseYamlDocument(text: string, lineCounter?: LineCounter) {
  return parseDocument(text, {lineCounter, uniqueKeys: false, strict: false, schema: 'yaml-1.1'});
}

/**
 * Wrapper that ensures consistent options
 */

export function parseAllYamlDocuments(text: string, lineCounter?: LineCounter) {
  return parseAllDocuments(text, {lineCounter, uniqueKeys: false, strict: false, schema: 'yaml-1.1'});
}

function containsPodSpec(kind: string) {
  return ['Deployment', 'DaemonSet', 'Job', 'ReplicaSet', 'StatefulSet', 'ReplicationController'].indexOf(kind) !== -1;
}

function setOctalFormat(mode: any) {
  if (mode && mode.format !== 'OCT') {
    mode.format = 'OCT';
  }
}

function setModePropertiesToOctal(node: any) {
  if (node) {
    setOctalFormat(node.get('defaultMode', true));
    node.get('items')?.items.forEach((item: any) => {
      if (item && item.get) {
        setOctalFormat(item.get('mode', true));
      }
    });
  }
}

/**
 * Finds nested Volume properties that should be set to OCT format - see
 * https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#volume-v1-core
 */
function setOctalFormatForVolumeModeProperties(volumes: any) {
  if (volumes?.items) {
    volumes.items.forEach((v: any) => {
      setModePropertiesToOctal(v.get('secret'));
      setModePropertiesToOctal(v.get('configMap'));

      let projectedNode = v.get('projected');
      if (projectedNode) {
        setOctalFormat(projectedNode.get('defaultMode', true));
        projectedNode.get('sources')?.items.forEach(() => {
          setModePropertiesToOctal(v.get('secret'));
          setModePropertiesToOctal(v.get('configMap'));
          setModePropertiesToOctal(v.get('downwardAPI'));
        });
      }

      setOctalFormat(v.get('downwardAPI')?.get('mode', true));
    });
  }
}

export function stringifyK8sResource(
  object: any,
  options?: DocumentOptions & SchemaOptions & ParseOptions & CreateNodeOptions & ToStringOptions
) {
  // special handling for octal values in Volumes in PodSpecs
  if (containsPodSpec(object.kind)) {
    let doc = new Document(object, {schema: 'yaml-1.1'});

    // @ts-ignore
    setOctalFormatForVolumeModeProperties(doc.get('spec')?.get('template')?.get('spec')?.get('volumes'));
    return doc.toString(options);
  }
  if (object.kind === 'Pod') {
    let doc = new Document(object, {schema: 'yaml-1.1'});

    // @ts-ignore
    setOctalFormatForVolumeModeProperties(doc.get('spec')?.get('volumes'));
    return doc.toString(options);
  }

  return stringify(object, options);
}

export function jsonToYaml(resource: any): string {
  return stringifyK8sResource(resource, {
    // In plain mode, scalar value `yes` and `no` are parsed as booleans
    // though most often they are intended as string scalars.
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN',
  });
}
