import editStep1 from '@assets/walkthrough/edit_step1.svg';
import editStep2 from '@assets/walkthrough/edit_step2.svg';
import exploreStep1 from '@assets/walkthrough/explore_step1.svg';
import exploreStep2 from '@assets/walkthrough/explore_step2.svg';
import exploreStep3 from '@assets/walkthrough/explore_step3.svg';
import publishStep1 from '@assets/walkthrough/publish_step1.svg';
import publishStep2 from '@assets/walkthrough/publish_step2.svg';
import validateStep1 from '@assets/walkthrough/validate_step1.svg';
import validateStep2 from '@assets/walkthrough/validate_step2.svg';

import {LearnTopicType} from '@shared/models';

export const WALK_THROUGH_STEPS: Record<LearnTopicType, {index: number; src: string}[]> = {
  explore: [
    {index: 0, src: exploreStep1},
    {index: 1, src: exploreStep2},
    {index: 2, src: exploreStep3},
  ],
  edit: [
    {index: 0, src: editStep1},
    {index: 1, src: editStep2},
  ],
  validate: [
    {index: 0, src: validateStep1},
    {index: 1, src: validateStep2},
  ],
  publish: [
    {index: 0, src: publishStep1},
    {index: 1, src: publishStep2},
  ],
};
