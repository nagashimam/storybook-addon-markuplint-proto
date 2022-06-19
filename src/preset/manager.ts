import { addons, types } from "@storybook/addons";
import { Panel } from "../Panel";

import * as HTMLParser from "@markuplint/html-parser";
import spec from "@markuplint/html-spec";
import { LocaleSet } from "@markuplint/i18n";
import { Violation } from "@markuplint/ml-config";
import { AnyRuleSeed, MLCore, MLRule, Ruleset } from "@markuplint/ml-core";
import rules from "@markuplint/rules";
import { API } from "@storybook/api";
import * as beautifier from "js-beautify";
import { Message, Result } from "src/types";
import { ADDON_ID, EVENTS, PANEL_ID } from "../constants";

// Register the addon
addons.register(ADDON_ID, (api) => {
  api.on(
    EVENTS.PARAMETERS_SET,
    async (ruleset) => await callVerify(api, ruleset)
  );
  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Markuplint",
    match: ({ viewMode }) => viewMode === "story",
    render: Panel,
  });
});

const callVerify = async (api: API, ruleset: Ruleset) => {
  const result = await getResult(ruleset);
  api.getChannel().emit(EVENTS.RESULT, result);
};

const getResult: (ruleset: Ruleset) => Promise<Result> = async (ruleset) => {
  const iframe = document.getElementById(
    "storybook-preview-iframe"
  ) as HTMLIFrameElement;
  const root = iframe.contentWindow.document.getElementById("root");

  // 整形しないと1行の長いHTMLになるので、どこで問題が起きているのか分かりにくい
  // 整形して適当に改行を入れる
  const uglyInnerHTML = root.innerHTML;
  const innerHTML = beautifier.html_beautify(uglyInnerHTML);
  const violations = root ? await verify(innerHTML, ruleset) : [];
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

export const verify: (
  innerHTML: string,
  ruleset: Ruleset
) => Promise<Violation[]> = async (innerHTML, ruleset) => {
  const localSet: unknown = await import("@markuplint/i18n/locales/ja.json");
  const linter = new MLCore({
    parser: HTMLParser,
    sourceCode: innerHTML,
    ruleset,
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
