import {CustomPluginLoader, SimpleCustomValidator, fetchBundleRequireCustomPlugin} from '@monokle/validation';

export const validationCustomPluginLoader: CustomPluginLoader = async (pluginName, parser) => {
  const customPlugin = await fetchBundleRequireCustomPlugin(pluginName);
  return new SimpleCustomValidator(customPlugin, parser);
};
