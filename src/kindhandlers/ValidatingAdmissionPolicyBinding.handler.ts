import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const ValidatingAdmissionPolicyHandler: ResourceKindHandler = {
  kind: 'ValidatingAdmissionPolicyBinding',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'ValidatingAdmissionPolicyBindings'],
  clusterApiVersion: 'admissionregistration.k8s.io/v1beta1',
  validationSchemaPrefix: 'io.k8s.api.admissionregistration.v1beta1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sAdmissionregistrationV1alpha1Api = kubeconfig.makeApiClient(k8s.AdmissionregistrationV1alpha1Api);
    k8sAdmissionregistrationV1alpha1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sAdmissionregistrationV1alpha1Api.readValidatingAdmissionPolicyBinding(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sAdmissionregistrationV1alpha1Api = kubeconfig.makeApiClient(k8s.AdmissionregistrationV1alpha1Api);
    k8sAdmissionregistrationV1alpha1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await k8sAdmissionregistrationV1alpha1Api.listValidatingAdmissionPolicyBinding();
    return response.body.items || [];
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sAdmissionregistrationV1alpha1Api = kubeconfig.makeApiClient(k8s.AdmissionregistrationV1alpha1Api);
    k8sAdmissionregistrationV1alpha1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sAdmissionregistrationV1alpha1Api.deleteValidatingAdmissionPolicyBinding(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/',
};

export default ValidatingAdmissionPolicyHandler;
