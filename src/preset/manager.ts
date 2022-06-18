import { addons, types } from "@storybook/addons";
import { Panel } from "../Panel";

import * as HTMLParser from "@markuplint/html-parser";
import spec from "@markuplint/html-spec";
import { LocaleSet } from "@markuplint/i18n";
import { Violation } from "@markuplint/ml-config";
import { AnyRuleSeed, MLCore, MLRule } from "@markuplint/ml-core";
import rules from "@markuplint/rules";
import { API } from "@storybook/api";
import { STORY_RENDERED } from "@storybook/core-events";
import * as beautifier from "js-beautify";
import { Message, Result } from "src/types";
import { ADDON_ID, EVENTS, PANEL_ID } from "../constants";

// Register the addon
addons.register(ADDON_ID, (api) => {
  api.on(STORY_RENDERED, async () => await callVerify(api));
  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Markuplint",
    match: ({ viewMode }) => viewMode === "story",
    render: Panel,
  });
});

const callVerify = async (api: API) => {
  const result = await getResult();
  api.getChannel().emit(EVENTS.RESULT, result);
};

const getResult: () => Promise<Result> = async () => {
  const iframe = document.getElementById(
    "storybook-preview-iframe"
  ) as HTMLIFrameElement;
  const root = iframe.contentWindow.document.getElementById("root");

  // 整形しないと1行の長いHTMLになるので、どこで問題が起きているのか分かりにくい
  // 整形して適当に改行を入れる
  const uglyInnerHTML = root.innerHTML;
  const innerHTML = beautifier.html_beautify(uglyInnerHTML);
  const violations = root ? await verify(innerHTML) : [];
  return violations.reduce(
    (prev: Result, cur: Violation): Result => {
      const message: Message = {
        title: cur.message,
        description: innerHTML.split("\n")[cur.line - 1],
      };
      if (cur.severity === "error") {
        prev.danger.push(message);
      } else if (cur.severity === "warning") {
        prev.warning.push(message);
      }
      return prev;
    },
    {
      danger: [],
      warning: [],
    }
  );
};

export const verify: (innerHTML: string) => Promise<Violation[]> = async (
  innerHTML
) => {
  const localSet: unknown = await import("@markuplint/i18n/locales/ja.json");
  const linter = new MLCore({
    parser: HTMLParser,
    sourceCode: innerHTML,
    ruleset: {
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
    },
    rules: Object.entries(rules as Record<string, AnyRuleSeed>).map(
      ([name, seed]) => new MLRule({ name, ...seed })
    ),
    locale: localSet as LocaleSet,
    schemas: [spec],
    parserOptions: {},
    filename: "anonymous",
  });
  return linter.verify(false);
};
