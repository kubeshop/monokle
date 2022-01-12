import {AnyPlugin} from './plugin';
import {AnyTemplate, TemplatePack} from './template';

export interface ContribState {
  isLoadingExistingPlugins: boolean;
  plugins: AnyPlugin[];
  isLoadingExistingTemplates: boolean;
  templates: AnyTemplate[];
  isLoadingExistingTemplatePacks: boolean;
  templatePacks: TemplatePack[];
}
