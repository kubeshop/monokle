import {helmFileCodeIntel} from '@molecules/Monaco/CodeIntel/helmChartFile';
import {helmValueCodeIntel} from '@molecules/Monaco/CodeIntel/helmValues';
import {resourceCodeIntel} from '@molecules/Monaco/CodeIntel/k8sResource';
import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';

export const codeIntels: CodeIntelApply[] = [helmValueCodeIntel, helmFileCodeIntel, resourceCodeIntel];

const a = 1;
