export type ComparisonListItem = HeaderItemProps | ComparisonItemProps;

export type HeaderItemProps = {
  type: 'header';
  kind: string;
  count: number;
};

export type ComparisonItemProps = {
  type: 'comparison';
  id: string;
  namespace: string;
  name: string;
  leftActive: boolean;
  rightActive: boolean;
  canDiff: boolean;
};
