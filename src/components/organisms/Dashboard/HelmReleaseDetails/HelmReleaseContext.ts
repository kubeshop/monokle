import {createStateContext} from 'react-use';

interface HelmReleaseContext {}

const [useHelmReleaseContext, HelmReleaseProvider] = createStateContext<HelmReleaseContext | undefined>(undefined);

export {useHelmReleaseContext, HelmReleaseProvider};
