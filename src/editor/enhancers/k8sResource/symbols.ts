import {clipboard} from 'electron';

import * as monaco from 'monaco-editor';

import {updateResourceFilter} from '@redux/reducers/main';
import {getResourceFromState} from '@redux/selectors/resourceGetters';

import SecretHandler from '@src/kindhandlers/Secret.handler';

import {
  addEditorCommand,
  addEditorDecorations,
  addEditorHover,
  getEditor,
  getEditorType,
} from '@editor/editor.instance';
import {createMarkdownString, getSymbols} from '@editor/editor.utils';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource, ResourceMeta} from '@shared/models/k8sResource';

import {createEditorEnhancer} from '../createEnhancer';

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
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const namespace = getSymbolValue(lines, symbol);
  if (namespace) {
    const newCommand = addEditorCommand({
      type: 'filter_namespace',
      text: `Apply or remove`,
      altText: 'Add/remove namespace to/from current filter',
      handler: () => {
        dispatch(updateResourceFilter({namespaces: [namespace], labels: {}, annotations: {}}));
      },
    });

    const filterMarkdown = createMarkdownString(`
| Filter resources by      |                                  |
|--------------------------|----------------------------------|
| namespace: ${namespace}  | ${newCommand.markdownLink.value} |
`);

    addEditorHover({
      range: symbol.range,
      contents: [filterMarkdown],
    });

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
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const kind = getSymbolValue(lines, symbol);
  if (kind) {
    const newCommand = addEditorCommand({
      type: 'filter_kind',
      text: `Apply or remove`,
      altText: 'Add/remove kind to/from current filter',
      handler: () => {
        dispatch(updateResourceFilter({kinds: [kind], labels: {}, annotations: {}}));
      },
    });

    const filterMarkdown = createMarkdownString(`
| Filter resources by |                                  |
|---------------------|----------------------------------|
| kind: ${kind}       | ${newCommand.markdownLink.value} |
`);

    addEditorHover({
      range: symbol.range,
      contents: [filterMarkdown],
    });

    addLinkDecoration(symbol, newDecorations);
  }
}

function addLabelFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const label = getSymbolValue(lines, symbol, true);
  if (label) {
    const value = label.substring(symbol.name.length + 1).trim();

    const newCommand = addEditorCommand({
      type: 'filter_label',
      text: `Apply or remove`,
      altText: 'Add/remove label to/from current filter',
      handler: () => {
        const labels: Record<string, string | null> = {};
        labels[symbol.name] = value;
        dispatch(updateResourceFilter({labels, annotations: {}}));
      },
    });

    const filterMarkdown = createMarkdownString(`
| Filter resources by          |                                  |
|------------------------------|----------------------------------|
| ${symbol.name}: ${value}     | ${newCommand.markdownLink.value} |
`);

    addEditorHover({
      range: symbol.range,
      contents: [filterMarkdown],
    });

    addLinkDecoration(symbol, newDecorations);
  }
}

function addAnnotationFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const annotation = getSymbolValue(lines, symbol, true);
  if (annotation) {
    const value = annotation.substring(symbol.name.length + 1).trim();

    const newCommand = addEditorCommand({
      type: 'filter_annotation',
      text: `${annotation}`,
      altText: 'Add/remove annotation to/from current filter',
      handler: () => {
        const annotations: Record<string, string | null> = {};
        annotations[symbol.name] = value;
        dispatch(updateResourceFilter({labels: {}, annotations}));
      },
    });

    const filterMarkdown = createMarkdownString(`
| Filter resources by          |                                  |
|------------------------------|----------------------------------|
| ${symbol.name}: ${value}     | ${newCommand.markdownLink.value} |
    `);

    addEditorHover({
      range: symbol.range,
      contents: [filterMarkdown],
    });

    addLinkDecoration(symbol, newDecorations);
  }
}
function addDecodeSecretHover(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const secret = getSymbolValue(lines, symbol, true);
  if (secret) {
    const value = secret.substring(symbol.name.length + 1).trim();
    const decoded = Buffer.from(value, 'base64').toString('utf-8');

    const newCommand = addEditorCommand({
      type: 'secret_copy_to_clipboard',
      text: 'Copy to clipboard',
      altText: 'Copy decoded secret to clipboard',
      handler: () => {
        clipboard.writeText(decoded);
      },
    });

    const secretMarkdown = createMarkdownString(`
| Secret value |                                  |
|--------------|----------------------------------|
| ${decoded}   | ${newCommand.markdownLink.value} |
`);

    addEditorHover({
      range: symbol.range,
      contents: [secretMarkdown],
    });

    addLinkDecoration(symbol, newDecorations);
  }
}

function processSymbol(
  resource: ResourceMeta,
  symbol: monaco.languages.DocumentSymbol,
  lines: string[],
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  if (getEditorType() === 'cluster') {
    if (symbol.containerName === 'data' && resource.kind === SecretHandler.kind) {
      addDecodeSecretHover(lines, symbol, newDecorations);
    }
    return;
  }

  if (symbol.children) {
    symbol.children.forEach(child => {
      processSymbol(resource, child, lines, dispatch, newDecorations);
    });
  }

  if (symbol.name === 'namespace') {
    addNamespaceFilterLink(lines, symbol, dispatch, newDecorations);
  }

  if (symbol.name === 'kind') {
    addKindFilterLink(lines, symbol, dispatch, newDecorations);
  }

  if (symbol.containerName) {
    const containerName = symbol.containerName;
    if (
      containerName === 'labels' ||
      containerName === 'matchLabels' ||
      (containerName === 'selector' && symbol.name !== 'matchLabels')
    ) {
      addLabelFilterLink(lines, symbol, dispatch, newDecorations);
    } else if (containerName === 'annotations') {
      addAnnotationFilterLink(lines, symbol, dispatch, newDecorations);
    } else if (containerName === 'data' && resource.kind === SecretHandler.kind) {
      addDecodeSecretHover(lines, symbol, newDecorations);
    }
  }
}

async function processSymbols(
  model: monaco.editor.ITextModel,
  resource: K8sResource,
  dispatch: AppDispatch,
  newDecorations: monaco.editor.IModelDeltaDecoration[]
) {
  const symbols: monaco.languages.DocumentSymbol[] = await getSymbols(model);
  const lines = resource.text.split('\n');

  symbols.forEach(symbol => processSymbol(resource, symbol, lines, dispatch, newDecorations));
}

export const resourceSymbolsEnhancer = createEditorEnhancer(async ({state, resourceIdentifier, dispatch}) => {
  const editor = getEditor();
  const model = editor?.getModel();
  if (!model || !resourceIdentifier) {
    return;
  }
  const resource = getResourceFromState(state, resourceIdentifier);

  if (!resource) {
    return;
  }

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  await processSymbols(model, resource, dispatch, decorations);

  addEditorDecorations(decorations);
});
