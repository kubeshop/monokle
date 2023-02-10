import * as Rt from 'runtypes';

export type K8sObject = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    [x: string]: any;
  };
  [x: string]: any;
};

export const K8sObjectRuntype: Rt.Runtype<K8sObject> = Rt.Record({
  apiVersion: Rt.String,
  kind: Rt.String,
  metadata: Rt.Record({
    name: Rt.String,
  }),
});

export const isK8sObject = K8sObjectRuntype.guard;
