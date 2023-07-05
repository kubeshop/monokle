export type NewResourceTelemtryType = 'AI' | 'advanced_template' | 'wizard';
export type NewResourceTelemtryFrom = 'empty_navigator' | 'navigator_header';

export type NewResourceAction = {
  image: string;
  hoverImage: string;
  typeLabel: string;
  onClick: () => void;
};

export type ResourceSavingDestination = 'doNotSave' | 'saveToFolder' | 'appendToFile';
