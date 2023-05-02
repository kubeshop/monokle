import {applyEditorRefs} from './k8sResource/refs';
import {resourceSymbolsEnhancer} from './k8sResource/symbols';
import {applyEditorValidation} from './k8sResource/validation';

export const editorEnhancers = [applyEditorValidation, applyEditorRefs, resourceSymbolsEnhancer];
