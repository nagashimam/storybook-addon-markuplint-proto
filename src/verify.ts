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
        "invalid-attr": true,
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
