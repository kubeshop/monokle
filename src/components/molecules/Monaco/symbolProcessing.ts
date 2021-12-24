import {clipboard} from 'electron';

import {monaco} from 'react-monaco-editor';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {
  createCommandMarkdownLink,
  createHoverProvider,
  createMarkdownString,
  getSymbols,
} from '@molecules/Monaco/editorHelpers';

import SecretHandler from '@src/kindhandlers/Secret.handler';

function getSymbolValue(lines: string[], symbol: monaco.languages.DocumentSymbol, includeName?: boolean) {
  const line = lines[symbol.range.startLineNumber - 1];
  if (line) {
    const str = line.substr(symbol.range.startColumn - 1, symbol.range.endColumn - symbol.range.startColumn);

    if (includeName) {
      return str;
    }

    const ix = str.indexOf(':', symbol.name.length);
    return str.substring(ix + 1).trim();
  }
}

function addNamespaceFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const namespace = getSymbolValue(lines, symbol);
  if (namespace) {
    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `${namespace}`,
      'Add/remove namespace to/from current filter',
      () => {
        filterResources({namespace, labels: {}, annotations: {}});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);
    addLinkDecoration(symbol, newDecorations);
  }
}

function addLinkDecoration(
  symbol: monaco.languages.DocumentSymbol,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const inlineDecoration: monaco.editor.IModelDeltaDecoration = {
    range: symbol.range,
    options: {
      inlineClassName: 'monokleEditorAddRemoveFilterInlineClass',
    },
  };

  newDecorations.push(inlineDecoration);
}

function addKindFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const kind = getSymbolValue(lines, symbol);
  if (kind) {
    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `${kind}`,
      'Add/remove kind to/from current filter',
      () => {
        filterResources({kind, labels: {}, annotations: {}});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);

    addLinkDecoration(symbol, newDecorations);
  }
}

function addLabelFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const label = getSymbolValue(lines, symbol, true);
  if (label) {
    const value = label.substring(symbol.name.length + 1).trim();

    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `${label}`,
      'Add/remove label to/from current filter',
      () => {
        const labels: Record<string, string | null> = {};
        labels[symbol.name] = value;
        filterResources({labels, annotations: {}});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);

    addLinkDecoration(symbol, newDecorations);
  }
}

function addAnnotationFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const annotation = getSymbolValue(lines, symbol, true);
  if (annotation) {
    const value = annotation.substring(symbol.name.length + 1).trim();

    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `${annotation}`,
      'Add/remove annotation to/from current filter',
      () => {
        const annotations: Record<string, string | null> = {};
        annotations[symbol.name] = value;
        filterResources({labels: {}, annotations});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);

    addLinkDecoration(symbol, newDecorations);
  }
}

function addDecodeSecretHover(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const secret = getSymbolValue(lines, symbol, true);
  if (secret) {
    const value = secret.substring(symbol.name.length + 1).trim();
    const decoded = Buffer.from(value, 'base64').toString('utf-8');

    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(decoded, 'Copy to clipboard', () => {
      clipboard.writeText(decoded);
    });
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Secret Value'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);

    addLinkDecoration(symbol, newDecorations);
  }
}

function processSymbol(
  resource: K8sResource,
  symbol: monaco.languages.DocumentSymbol,
  parents: monaco.languages.DocumentSymbol[],
  lines: string[],
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  if (symbol.children) {
    symbol.children.forEach(child => {
      processSymbol(resource, child, parents.concat(symbol), lines, filterResources, newDisposables, newDecorations);
    });
  }

  if (symbol.name === 'namespace') {
    addNamespaceFilterLink(lines, symbol, filterResources, newDisposables, newDecorations);
  }

  if (symbol.name === 'kind') {
    addKindFilterLink(lines, symbol, filterResources, newDisposables, newDecorations);
  }

  if (parents.length > 0) {
    const lastParent = parents[parents.length - 1];
    if (!lastParent) {
      return;
    }
    const parentName = lastParent.name;

    if (parentName === 'labels' || parentName === 'matchLabels') {
      addLabelFilterLink(lines, symbol, filterResources, newDisposables, newDecorations);
    } else if (parentName === 'annotations') {
      addAnnotationFilterLink(lines, symbol, filterResources, newDisposables, newDecorations);
    } else if (parentName === 'data' && resource.kind === SecretHandler.kind) {
      addDecodeSecretHover(lines, symbol, newDisposables, newDecorations);
    }
  }
}

export async function processSymbols(
  model: monaco.editor.ITextModel,
  resource: K8sResource,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[],
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const symbols: monaco.languages.DocumentSymbol[] = await getSymbols(model);
  const lines = resource.text.split('\n');

  symbols.forEach(symbol =>
    processSymbol(resource, symbol, [], lines, filterResources, newDisposables, newDecorations)
  );
}
