import {CLUSTER_AVAILABLE_COLORS} from '@constants/constants';

import Colors, {BackgroundColors} from '@styles/Colors';

type ClusterColors = typeof CLUSTER_AVAILABLE_COLORS[number] | Colors.volcano8 | BackgroundColors;

export type {ClusterColors};
