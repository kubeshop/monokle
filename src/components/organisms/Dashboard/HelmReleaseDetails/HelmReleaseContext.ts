import {createStateContext} from 'react-use';

import {CommandOptions} from '@shared/models/commands';

interface HelmReleaseDiff {
  leftCommand: CommandOptions;
  rightCommand: CommandOptions;
  okText: string;
  okHandler: () => void;
  open: boolean;
}

const [useHelmReleaseDiffContext, HelmReleaseProvider] = createStateContext<HelmReleaseDiff | undefined>(undefined);

export {useHelmReleaseDiffContext, HelmReleaseProvider};
