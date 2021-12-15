import {MonoklePlugin} from './plugin';
import {MonokleTemplate} from './template';

export interface ContribState {
  isLoadingExistingPlugins: boolean;
  plugins: MonoklePlugin[];
  isLoadingExistingTemplates: boolean;
  templates: MonokleTemplate[];
}
