import log from 'loglevel';
import {ChatCompletionRequestMessage} from 'openai';

import {createChatCompletion} from '@redux/hackathon/hackathon.ipc';
import {extractK8sResources} from '@redux/services/resource';
import {VALIDATOR} from '@redux/validation/validator';

import {transformResourceForValidation} from '@utils/resources';

import {isDefined} from '@shared/utils/filter';

import {extractYaml} from './utils';

const GENERATION_PROMPT_START = `In this interaction, the goal is to produce Kubernetes YAML code based on specific requirements and specifications.
Generate YAML code that FULLY adheres to the requirements below, in the context of Kubernetes.
Start of the requirements:`;

const GENERATION_PROMPT_END = ` End of the requirements!
The output should consist exclusively of the YAML code necessary to fulfill the given task.
Remember, the output code may span across multiple YAML documents if that's what's needed to incorporate all necessary Kubernetes objects.
\`\`\`yaml\n`;

const createGenerationPrompt = (payload: {userPrompt: string}): ChatCompletionRequestMessage[] => {
  const {userPrompt} = payload;
  return [
    {
      role: 'user',
      content: `${GENERATION_PROMPT_START}\n${userPrompt}\n${GENERATION_PROMPT_END}`,
    },
  ];
};

const VALIDATION_PROMPT_START = 'The above YAML code was generated based on the following requirements:';

const VALIDATION_PROMPT_MIDDLE =
  'Below we are providing a list of errors and warnings that were identified in the code.\n';

const VALIDATION_PROMPT_END = `Based on the above list, please rewrite the previous code to fix all problems.
\`\`\`yaml\n`;

const validateGeneratedYaml = async (payload: {
  generatedYaml: string;
}): Promise<{errorText: string; helpText?: string}[]> => {
  const {generatedYaml} = payload;
  const resources = extractK8sResources(generatedYaml, 'transient', {createdIn: 'local'});
  const {response} = await VALIDATOR.runValidation({
    resources: resources.map(transformResourceForValidation).filter(isDefined),
  });
  const list: {errorText: string; helpText?: string}[] = [];
  response?.runs
    .filter(run => run.tool.driver.name !== 'resource-links')
    .forEach(run => {
      run.results.forEach(result => {
        const help = run.tool.driver.rules.find(rule => rule.id === result.ruleId)?.help;
        list.push({errorText: result.message.text, helpText: help?.text});
      });
    });
  return list;
};

const createValidationPrompt = async (payload: {
  userPrompt: string;
  generatedYaml: string;
}): Promise<ChatCompletionRequestMessage[] | undefined> => {
  const {userPrompt, generatedYaml} = payload;

  const validationErrors = await validateGeneratedYaml({generatedYaml});

  if (!validationErrors.length) {
    return;
  }

  const validationText = validationErrors
    .map(({errorText, helpText}) => {
      return `- ${errorText}. ${helpText ? `${helpText}` : ''}`;
    })
    .join('\n  ');

  return [
    {
      role: 'user',
      content: `${generatedYaml}
${VALIDATION_PROMPT_START}
${userPrompt}
${VALIDATION_PROMPT_MIDDLE}
${validationText}
${VALIDATION_PROMPT_END}`,
    },
  ];
};

export const generateYamlUsingAI = async (payload: {
  userPrompt: string;
  shouldValidate?: boolean;
}): Promise<string | undefined> => {
  const {userPrompt, shouldValidate} = payload;
  let content = await createChatCompletion({messages: createGenerationPrompt({userPrompt})});
  if (!content) {
    log.info('[generateYamlUsingAI]: No content generated.');
    return;
  }
  const generatedYaml = extractYaml(content);
  if (!generatedYaml) {
    log.info('[generateYamlUsingAI]: No YAML generated.');
    return;
  }
  if (!shouldValidate) {
    log.info('[generateYamlUsingAI]: Skipping validation.');
    return generatedYaml;
  }
  const validationPrompt = await createValidationPrompt({userPrompt, generatedYaml});
  if (!validationPrompt) {
    log.info('[generateYamlUsingAI]: No validation prompt generated.');
    return generatedYaml;
  }
  content = await createChatCompletion({messages: validationPrompt});
  if (!content) {
    log.info('[generateYamlUsingAI]: No content generated after validation. Returning initial YAML.');
    return generatedYaml;
  }
  const validatedYaml = extractYaml(content);
  if (!validatedYaml) {
    log.info('[generateYamlUsingAI]: No YAML generated after validation. Returning initial YAML.');
    return generatedYaml;
  }
  return validatedYaml;
};
