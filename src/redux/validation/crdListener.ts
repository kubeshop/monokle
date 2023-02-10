import {KindHandlersEventEmitter} from '@src/kindhandlers';

import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import {VALIDATOR} from './validation.services';

KindHandlersEventEmitter.on('register', (kindHandler: ResourceKindHandler) => {
  if (kindHandler.isCustom && kindHandler.formEditorOptions?.editorSchema) {
    VALIDATOR.registerCustomSchema({
      schema: {
        apiVersion: kindHandler.clusterApiVersion,
        kind: kindHandler.kind,
        schema: kindHandler.formEditorOptions.editorSchema,
      },
    });
  }
});
