import fs from 'fs';
import path from 'path';

const k8Path = `${__dirname}${path.sep}..${path.sep}..${path.sep}resources${path.sep}schemas${path.sep}k8sschemas.json`;
const schemaDir = `${__dirname}${path.sep}..${path.sep}..${path.sep}resources${path.sep}form-schemas`;

const rootPropertiesToIgnore = ['apiVersion', 'kind', 'metadata'];

const kubernetesSchema = JSON.parse(fs.readFileSync(k8Path, 'utf-8')).definitions;

export const generateSchema = (kind: string) => {
  const kindDefinitionKey = Object.keys(kubernetesSchema).find((key) => {
    const parts = key.split('.');
    return parts[parts.length - 1] === kind;
  });

  if (!kindDefinitionKey) {
    throw new Error(`cannot find ${kind}`);
  }

  const kindDefinition = kubernetesSchema[kindDefinitionKey];

  const { properties, propertiesUi } = parseFields(kindDefinition.properties, true);
  const schemaDefinition = {
    properties,
    type: 'object',
  };
  const schemaUIDefinition = {
    'ui:title': `${kind} Properties`,
    ...propertiesUi,
  };

  const schemaFilename = `${kind.toLocaleLowerCase()}-schema.json`;
  const schemaUiFilename = `${kind.toLocaleLowerCase()}-ui-schema.json`;

  fs.writeFileSync(`${schemaDir}${path.sep}${schemaFilename}`,
    JSON.stringify(schemaDefinition, null, 2));
  fs.writeFileSync(`${schemaDir}${path.sep}${schemaUiFilename}`,
    JSON.stringify(schemaUIDefinition, null, 2));

  console.log(`Created ${schemaFilename} and ${schemaUiFilename} in schema dir`);
};

const getKeyFromRef = (keyDefinition: any) => {
  const parts = keyDefinition['$ref'].split('/');
  return parts[parts.length - 1];
};

const capitalFirstLetter = (key: string) => {
  return key[0].toUpperCase() + key.slice(1);
};

const prettyUiTitle = (key: string) => {
  return capitalFirstLetter(key)
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

const parseFields = (definition: any, firstCall = false) => {
  const schemaDefinition: any = {};
  const schemaUiDefinition: any = {};

  Object.keys(definition).forEach((key) => {
    const keyDefinition = definition[key];

    if (firstCall && rootPropertiesToIgnore.includes(key)) {
      return;
    }

    const hasRef = Boolean(keyDefinition['$ref']);
    const hasItems = Boolean(keyDefinition['items']);

    if (hasRef) {
      const childKey = getKeyFromRef(keyDefinition);

      if (!kubernetesSchema[childKey].properties) {
        return;
      }

      const { properties, propertiesUi } = parseFields(kubernetesSchema[childKey].properties);
      schemaDefinition[key] = {
        type: 'object',
        properties,
      };
      schemaUiDefinition[key] = {
        'ui:title': `Object ${key}s`,
        ...propertiesUi,
      };
    } else if (hasItems) {
      if (keyDefinition.items['$ref']) {
        const childKey = getKeyFromRef(keyDefinition.items);
        const { properties, propertiesUi } = parseFields(kubernetesSchema[childKey].properties);
        schemaDefinition[key] = {
          type: 'array',
          items: {
            type: 'object',
            properties,
          },
        };
        schemaUiDefinition[key] = {
          'ui:title': capitalFirstLetter(key),
          items: propertiesUi,
        };
      } else {
        schemaDefinition[key] = {
          type: 'array',
          items: {
            type: keyDefinition.items.type,
          },
        };
        schemaUiDefinition[key] = {
          'ui:title': prettyUiTitle(key),
        };
      }
    } else {
      schemaDefinition[key] = {
        type: keyDefinition.type,
      };
      schemaUiDefinition[key] = {
        'ui:title': prettyUiTitle(key),
      };
      if (key === 'namespace') {
        schemaUiDefinition[key]['ui:widget'] = 'namespaceSelection';
      }
    }
  });

  return {
    properties: schemaDefinition,
    propertiesUi: schemaUiDefinition,
  };
};
