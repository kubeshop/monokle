import {LineCounter, Scalar, parseAllDocuments, parseDocument, stringify} from 'yaml';

/**
 * Wrapper that ensures consistent options
 */

export function parseYamlDocument(text: string, lineCounter?: LineCounter) {
  return parseDocument(text, {lineCounter, uniqueKeys: false, strict: false});
}

/**
 * Wrapper that ensures consistent options
 */

export function parseAllYamlDocuments(text: string, lineCounter?: LineCounter) {
  return parseAllDocuments(text, {lineCounter, uniqueKeys: false, strict: false});
}

export function jsonToYaml(resource: any): string {
  return stringify(resource, {
    // In plain mode, scalar value `yes` and `no` are parsed as booleans
    // though most often they are intended as string scalars.
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN',
  });
}

export interface RefPosition {
  line: number;
  column: number;
  length: number;
  endLine?: number;
  endColumn?: number;
}

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
