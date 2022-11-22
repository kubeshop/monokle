export type ComparisonListItem = HeaderItemProps | ComparisonItemProps;

export type HeaderItemProps = {
  type: 'header';
  kind: string;
  countLeft: number;
  countRight: number;
};

export type ComparisonItemProps = {
  type: 'comparison';
  id: string;
  leftNamespace?: string | undefined;
  rightNamespace?: string | undefined;
  namespace?: string | undefined;
  name: string;
  leftActive: boolean;
  leftTransferable: boolean;
  rightActive: boolean;
  rightTransferable: boolean;
  canDiff: boolean;
  kind: string;
};
