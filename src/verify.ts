import { Violation } from "@markuplint/ml-config";
import { AnyRuleSeed, MLCore, MLRule } from "@markuplint/ml-core";
import * as HTMLParser from "@markuplint/html-parser";
import { LocaleSet } from "@markuplint/i18n";
import spec from "@markuplint/html-spec";
import rules from "@markuplint/rules";

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
        "invalid-attr": true,
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
