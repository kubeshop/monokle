import {applyEditorRefs} from './k8sResource/refs';
import {applyEditorValidation} from './k8sResource/validation';

export const editorEnhancers = [applyEditorValidation, applyEditorRefs];
