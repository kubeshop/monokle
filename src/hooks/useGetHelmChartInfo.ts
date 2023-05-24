import fetch from 'node-fetch';
import {useEffect} from 'react';
import {useAsyncFn} from 'react-use';

export const useGetHelmChartInfo = (helmChartName: string) => {
  const [state, fetchChart] = useAsyncFn(async (): Promise<HelmChartInfo> => {
    const [repoName, chartName] = helmChartName.split('/') as [string, string];
    const results = await fetch(`https://artifacthub.io/api/v1/packages/helm/${repoName}/${chartName}`);

    if (results.status !== 200) {
      throw new Error('Failed to fetch helm chart info');
    }

    return results.json();
  }, [helmChartName]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return state;
};

interface HelmChartInfo {
  package_id: string;
  name: string;
  normalized_name: string;
  logo_image_id: string;
  display_name: string;
  description: string;
  version: string;
  app_version: string;
  license: string;
  deprecated: boolean;
  signed: boolean;
  signatures: string[];
  official: boolean;
  cncf: boolean;
  ts: number;
  repository: Repository;
  security_report_summary: SecurityReportSummary;
  all_containers_images_whitelisted: boolean;
  production_organizations_count: number;
  is_operator: boolean;
  latest_version: string;
  logo_url: string;
  category: number;
  keywords: string[];
  home_url: string;
  readme: string;
  links: Link[];
  available_versions: AvailableVersion[];
  maintainers: Maintainer[];
  default_channel: string;
  channels: Channel[];
  provider: string;
  containers_images: ContainersImages;
  capabilities: string;
  security_report_created_at: number;
  has_values_schema: boolean;
  has_changelog: boolean;
  content_url: string;
  contains_security_updates: boolean;
  prerelease: boolean;
  recommendations: Recommendation[];
  stats: Stats;
  sign_key: SignKey;
  crds: Crd[];
  crds_examples: CrdsExample[];
  data: Data;
}

export interface Repository {
  repository_id: string;
  kind: number;
  name: string;
  display_name: string;
  url: string;
  verified_publisher: boolean;
  official: boolean;
  cncf: boolean;
  private: boolean;
  scanner_disabled: boolean;
  user_alias: string;
  organization_name: string;
  organization_display_name: string;
}

export interface SecurityReportSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

export interface Link {
  url: string;
  name: string;
}

export interface AvailableVersion {
  version: string;
  contains_security_updates: boolean;
  prerelease: boolean;
  ts: number;
}

export interface Maintainer {
  maintainer_id: string;
  name: string;
  email: string;
}

export interface Channel {
  name: string;
  version: string;
}

export interface ContainersImages {
  image: string;
  name: string;
  whitelisted: boolean;
}

export interface Recommendation {
  url: string;
}

export interface Stats {
  subscriptions: number;
  webhooks: number;
}

export interface SignKey {
  fingerprint: string;
  url: string;
}

export interface Crd {
  kind: string;
  name: string;
  version: string;
  description: string;
  displayName: string;
}

export interface CrdsExample {
  additionalProp1: AdditionalProp1;
}

export interface AdditionalProp1 {}

export interface Data {
  apiVersion: string;
  type: string;
  kubeVersion: string;
  dependencies: Dependencies;
}

export interface Dependencies {
  name: string;
  version: string;
  repository: string;
}
