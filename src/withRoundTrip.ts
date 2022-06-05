import { useChannel } from "@storybook/addons";
import type { DecoratorFunction } from "@storybook/addons";
import { STORY_CHANGED } from "@storybook/core-events";
import { EVENTS } from "./constants";
import { verify } from "./verify";
import { Message, Result } from "./types";
import { Violation } from "@markuplint/ml-config";
import * as beautifier from "js-beautify";

export const withRoundTrip: DecoratorFunction = (storyFn) => {
  const emit = useChannel({
    [EVENTS.REQUEST]: async () => {
      const result = await getResult();
      emit(EVENTS.RESULT, result);
    },
    [STORY_CHANGED]: () => {
      emit(EVENTS.RESULT, {
        danger: [],
        warning: [],
      });
    },
    [EVENTS.CLEAR]: () => {
      emit(EVENTS.RESULT, {
        danger: [],
        warning: [],
      });
    },
  });
  return storyFn();
};

const getResult: () => Promise<Result> = async () => {
  const root = document.getElementById("root");

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
