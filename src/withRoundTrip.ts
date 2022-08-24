import { Ruleset } from "@markuplint/ml-core";
import { DecoratorFunction, useChannel, useParameter } from "@storybook/addons";
import { EVENTS, PARAM_KEY } from "./constants";

const defaultParameter: Ruleset = {
  rules: {
    "attr-duplication": true,
    "deprecated-attr": true,
    "deprecated-element": true,
    "disallowed-element": true,
    doctype: true,
    "id-duplication": true,
    "ineffective-attr": true,
    "invalid-attr": {
      option: {
        ignoreAttrNamePrefix: ["app", "*ng", "ng", "_ng"],
      },
    },
    "permitted-contents": true,
    "required-attr": true,
    "required-element": true,
    "landmark-roles": true,
    "no-refer-to-non-existent-id": true,
    "require-accessible-name": true,
    "required-h1": true,
    "use-list": true,
    "wai-aria": true,
    "no-hard-code-id": true,
    "no-use-event-handler-attr": true,
    "attr-equal-space-after": true,
    "attr-equal-space-before": true,
    "attr-spacing": true,
    "attr-value-quotes": true,
    "case-sensitive-attr-name": true,
    "case-sensitive-tag-name": true,
    "end-tag": true,
    "no-boolean-attr-value": true,
    "no-default-value": true,
  },
  childNodeRules: [],
  nodeRules: [],
};

export const withRoundTrip: DecoratorFunction = (storyFn) => {
  const emit = useChannel({});
  const ruleSet = useParameter<Ruleset>(PARAM_KEY, defaultParameter);
  emit(EVENTS.PARAMETERS_SET, ruleSet);
  return storyFn();
};
