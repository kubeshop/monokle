type ComparisonListItem = HeaderItemProps | ComparisonItemProps;

type HeaderItemProps = {
  type: 'header';
  kind: string;
  count: number;
};

type ComparisonItemProps = {
  type: 'comparison';
  id: string;
  namespace: string | undefined;
  name: string;
  leftActive: boolean;
  leftTransferable: boolean;
  rightActive: boolean;
  rightTransferable: boolean;
  canDiff: boolean;
};

export type {ComparisonListItem, ComparisonItemProps, HeaderItemProps};
