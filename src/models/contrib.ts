import {MonoklePlugin} from './plugin';
import {AnyTemplate, TemplateDiscovery} from './template';

export interface ContribState {
  isLoadingExistingPlugins: boolean;
  plugins: MonoklePlugin[];
  isLoadingExistingTemplates: boolean;
  templates: AnyTemplate[];
  templateDiscoveries: TemplateDiscovery[];
}
