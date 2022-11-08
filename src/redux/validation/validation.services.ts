import {ResourceParser, SchemaLoader, createDefaultMonokleValidator} from '@monokle/validation';

export const RESOURCE_PARSER = new ResourceParser();
export const SCHEMA_LOADER = new SchemaLoader();
export const VALIDATOR = createDefaultMonokleValidator(RESOURCE_PARSER, SCHEMA_LOADER);
