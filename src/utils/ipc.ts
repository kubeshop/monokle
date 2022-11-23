import {StartupFlags} from '@monokle-desktop/shared/models/startupFlag';

import {StartupFlag} from './startupFlag';

export function getChannelName(name: string, hasAutomationFlag = StartupFlag.getInstance().hasAutomationFlag) {
  if (hasAutomationFlag) {
    return `${name}-${StartupFlags.AUTOMATION}`;
  }

  return name;
}
