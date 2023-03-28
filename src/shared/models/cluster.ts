import {BackgroundColors, Colors} from '../styles/colors';

type ClusterColors = Colors | BackgroundColors;

interface ClusterProxyOptions {
  kubeConfigPath: string;
}

export type {ClusterColors, ClusterProxyOptions};
