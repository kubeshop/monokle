import {ipcRenderer} from 'electron';

import {UPDATE_EXTENSIONS, UPDATE_EXTENSIONS_RESULT} from '@constants/ipcEvents';

import {AlertEnum} from '@models/alert';
import {UpdateExtensionsResult, isUpdateExtensionsResult} from '@models/extension';

import {setAlert} from '@redux/reducers/alert';
import {addMultiplePlugins, addMultipleTemplatePacks, addMultipleTemplates} from '@redux/reducers/extension';
import {AppDispatch} from '@redux/store';

export const updateExtensions = () => {
  return new Promise<UpdateExtensionsResult>((resolve, reject) => {
    const downloadTemplateResult = (_: any, result: UpdateExtensionsResult | Error) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      if (!isUpdateExtensionsResult(result)) {
        reject(new Error(`Failed Template installation.`));
        return;
      }
      resolve(result);
    };
    ipcRenderer.once(UPDATE_EXTENSIONS_RESULT, downloadTemplateResult);
    ipcRenderer.send(UPDATE_EXTENSIONS);
  });
};

export const checkForExtensionsUpdates = async (dispatch: AppDispatch) => {
  try {
    const result = await updateExtensions();
    const {templateExtensions, templatePackExtensions, pluginExtensions} = result;
    dispatch(addMultipleTemplates(templateExtensions));
    dispatch(addMultipleTemplatePacks(templatePackExtensions));
    dispatch(addMultiplePlugins(pluginExtensions));
    if (templateExtensions.length === 0 && templatePackExtensions.length === 0 && pluginExtensions.length === 0) {
      dispatch(
        setAlert({
          type: AlertEnum.Info,
          title: 'Templates and plugins are up to date',
          message: 'No new version has been found.',
        })
      );
    } else {
      dispatch(
        setAlert({
          type: AlertEnum.Info,
          title: 'Updated templates and plugins successfully',
          message: `Updated ${templateExtensions.length} templates, ${templatePackExtensions.length} template packs and ${pluginExtensions.length} plugins.`,
        })
      );
    }
  } catch (e) {
    if (e instanceof Error) {
      dispatch(
        setAlert({
          type: AlertEnum.Error,
          title: 'Failed to update templates and plugins',
          message: `Something went wrong... ${e.message}`,
        })
      );
    }
  }
};
