export type NewResourceTelemtryType = 'AI' | 'advanced_template' | 'wizard';
export type NewResourceTelemtryFrom = 'empty_navigator' | 'navigator_header';

export type NewResourceAction = {
  image: string;
  hoverImage: string;
  fromTypeLabel: 'AI' | 'advanced template' | 'model';
  onClick: () => void;
};

export type ResourceSavingDestination = 'doNotSave' | 'saveToFolder' | 'appendToFile';
