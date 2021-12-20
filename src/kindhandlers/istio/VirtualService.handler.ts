import {createCustomObjectKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

const VIRTUAL_SERVICE_GROUP = 'networking.istio.io';
const VIRTUAL_SERVICE_PLURAL = 'virtualservices';
const VIRTUAL_SERVICE_VERSION = 'v1beta1';

const VirtualServiceHandler = createCustomObjectKindHandler(
  'VirtualService',
  'Istio',
  'VirtualServices',
  VIRTUAL_SERVICE_GROUP,
  VIRTUAL_SERVICE_VERSION,
  VIRTUAL_SERVICE_PLURAL,
  'istio/virtualservice.json'
);

export default VirtualServiceHandler;
